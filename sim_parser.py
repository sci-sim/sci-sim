import codecs
from sys import argv, exit
from scisim.models import *
from scisim import next_id
import re
import traceback

def debug(*exps):
	for exp in exps:
		print("---------------------")
		print(exp)
		print("---------------------")
	exit()

def parse_sim(sim_template):
	sim_template = clean_comments(sim_template)

	# errors = check_for_errors(sim_template)
	# if errors:
	# 	debug(errors)
	# 	return errors
		
	pages = get_all_pages(sim_template)
	page_base = (db.engine.execute("select count() from simulations").fetchone()[0]) * 1000

	simulation_name = find_keyword_value("simulation_name", sim_template)
	password = find_keyword_value("simulation_password", sim_template)
	description = find_keyword_value("simulation_description", sim_template)
	preview_picture = find_keyword_value("simulation_preview_picture", sim_template)

	sim = Simulation(title=simulation_name, desc=description, password=password, preview_image_filename=preview_picture, first_page_id=page_base)

	db.session.add(sim)
	db.session.commit()

	print("Simulation added.")

	for page in pages:
		process_page(page, sim, page_base)
		page_base += 1

	return None

def get_all_pages(sim):
	all_lines = sim.splitlines()
	pages = []
	for i, line in enumerate(all_lines):
		if re.match(r'.*page\s*=\s*\[', line): # had to get real specific here.
			pages.append(page_loop(i, all_lines))
	return pages

def page_loop(start_line, all_lines):
	page = all_lines[start_line] + "\n"

	for i,line in enumerate(all_lines[(start_line+1):]):
		if "page" in line and "[" in line:
			return page
		else:
			page += line + "\n"

	return page

def process_page(page_text, sim, page_id):
	page = None
	order = 0
	
	all_lines = page_text.splitlines()


	for i, line in enumerate(all_lines):
		try:
			keyword, content = split_key_value(line)

		except Exception, e:
			# this line doesn't have content we want, so go to the next one
			continue
		
		if keyword == "page_name":
			print("Adding page")
			page = Page(sim=sim, title=strip_braces(content), id=page_id)
			db.session.add(page)
			db.session.commit()

		elif keyword == "heading_big":
			print("Found a big heading")
			add_section(i, all_lines, order, content, page, "big")
			order += 1

		elif keyword == "heading_medium":
			print("found medium heading")
			add_section(i, all_lines, order, content, page, "medium")
			order += 1

		elif keyword == "heading_small":
			print("found small heading")
			add_section(i, all_lines, order, content, page, "small")
			order += 1

		elif keyword == "text":
			print("found text")
			add_section(i, all_lines, order, content, page, "regular")
			order += 1

		elif keyword == "media":
			print("Found media")
			add_section(i, all_lines, order, "media " + content, page)

		elif keyword == "minimum_choices" or keyword == "choice_minimum" or keyword == "choice_limit":
			print("found choices")
			add_page_modifier(page, keyword, content)

		elif keyword == "choice_limit_page" or keyword == "minimum_choices_reached_page":
			print("adding choice")
			add_page_modifier(page, keyword, content)

		elif keyword == "minimum_choices_reached_page" and keyword == "minimum_choices_reached":
			print("Fond min choice page")
			add_page_action(page, keyword, content)

		elif keyword == "choice":
			print("found choice")
			lines = select_until(i, all_lines, "]").splitlines();
			parse_choice(lines, page)

		elif keyword == "add_to_notebook":
			lines = select_until(i, all_lines, "]")
			text = find_keyword_value("text", lines)
			tag = find_keyword_value("tag", lines)

			add_page_action(page, keyword, text + "|" + tag)

		elif keyword == "pop_up_window" or keyword == "popup_window":
			add_page_modifier(page, keyword, content)

		elif keyword == "link":
			lines = select_until(i, all_lines, ']')
			parse_link(lines, page, order)
			order += 1

		elif keyword == "question":
			lines = select_until(i, all_lines, ']')
			parse_question(lines, page)

		elif keyword == "can_add_question_groups":
			add_page_modifier(page, keyword, strip_braces(content))

		elif keyword == "show_all_student_content":
			add_page_action(page, keyword, strip_braces(content))


def parse_choice(lines, page):
	type = None
	text = None
	destination = None

	for i, line in enumerate(lines):
		if "prompt" in line or "textbox" in line:
			type = "text"
			text = get_text(i, line, lines)

		elif "binary" in line:
			type = "binary"
			text = get_text(i, line, lines)

		elif "goes_to_page" in line:
			destination = get_text(i , line, lines)

	print("Adding a choice to the database")
	db.session.add(Choice(type=type, text=text, destination=destination, page_id = page.id))
	db.session.commit()

def parse_link(lines, page, order):
	# get content from lines
	text = find_keyword_value("text", lines)
	link = find_keyword_value("url", lines)

	content = "<a href='"+link+"'>"+text+">"

	db.session.add(Section(show=True, order=order, content=content, page_id=page.id))
	db.session.commit()

def parse_question(lines, page):
	text = find_keyword_value("text", lines)
	tag = find_keyword_value("tag", lines)

	db.session.add(Choice(type="question", text=text, page_id = page.id, tag=tag))
	db.session.commit()

def add_section(line_number, all_lines, order, content, page, size=None):
	print("Adding section")

	content = get_text(line_number, content, all_lines)
	content = content

	if size == "small":
		tags = "<h3>content</h3>"
	elif size == "big":
		tags = "<h1>content</h1>"
	elif size == "medium":
		tags = "<h2>content</h2>"
	elif size == "regular":
		tags = "<p>content</p>"

	if size: # we do this check to make sure that there's no media here. If there's media, then size won't be passed in
		content = tags.replace("content", content)

	try:
		db.session.add(Section(show=True, order=order, content=strip_braces(content), page_id = page.id))
	except Exception, e:
		debug(all_lines[line_number:line_number+10], e)
	
	db.session.commit()

def add_page_modifier(page, name, value):
	print("adding a page modifier")

	db.session.add(Page_Modifier(name=name, value=strip_braces(value), page_id=page.id))
	db.session.commit()

def add_page_action(page, name, value):
	print("adding a page action")
	db.session.add(Page_Action(name=name, value=strip_braces(value), page_id=page.id))
	db.session.commit()

def check_for_errors(sim):
	sim = clean_comments(sim)
	errors = {}
	
	essential_keyword_errors = check_for_essential_keywords(sim)
	# check to make sure that all keywords have closing tags
	tag_errors = check_all_tags_close(sim)
	# check to make sure all pages that you go to exist
	existant_errors = check_all_pages_exist(sim)
	# make sure all pages have either popup_menu, choices, or goes_to_page
	continuity_errors = check_pages_have_continuity(get_all_pages(sim))

	if tag_errors:
		errors['Missing closing tags the middle line:'] = tag_errors
	if existant_errors:
		errors['These pages do not exist:'] = existant_errors
	if continuity_errors:
		errors["These pages have continuity errors:"] = continuity_errors
	if essential_keyword_errors:
		errors['Missing essential keywords:'] = essential_keyword_errors

	if len(errors) > 0:
		return errors

	return None

def check_for_essential_keywords(sim):
	keywords = ['simulation_name', "simulation_password", 'simulation_description']
	errors = []

	for keyword in keywords:
		match = find_keyword_value(keyword, sim)
		if match == None:
			errors.append("Missing keyword: " + keyword)

	if len(errors) == 0:
		return None
	else:
		return errors

def check_all_tags_close(sim):
	error_lines = []
	lines = sim.splitlines();

	for i,line in enumerate(lines):
		if "=" in line and "{" not in line and "[" not in line and "}" not in line:
			error_lines.append("Missing opening tag on middle line: " + lines[i - 1] + "\n" + line + "\n" + lines[i + 1])


	# first we're going to check if the number of opening and closing tags are the same.
	if sim.count("{") != sim.count("}") or sim.count("[") != sim.count("]"):
		for i,line in enumerate(lines):
			# if not, we're going to check all the assignments to see if there's an opening tag
			if "=" in line:
				if "{" not in line and "[" not in line and "}" not in line:
					error_lines.append('Missing opening symbol on middle line: ' +  (lines[i - 1] + "\n" + line + "\n" + lines[i + 1]))

				# now we check to see if there is a closing tag
				if "{" in line and "}" not in line:
					selection_till_closing_tag = select_until(i, lines, "}")
					if selection_till_closing_tag.count("{") > 0:
						error_lines.append('Missing closing tag ( } ) on middle line: ' + (lines[i - 1] + "\n" + line + "\n" + lines[i + 1]))

				if "[" in line and "page" in line:
					selection = select_until(i, lines, "page")

					number_of_choices = selection.count("choice")
					number_of_closing_tags = selection.count("]")
					
					if number_of_choices == number_of_closing_tags:
						error_lines.append("Missing closing tag ( ] ) on middle line: " + (lines[i - 1] + "\n" + line + "\n" + lines[i + 1]))

	if len(error_lines) > 0: return error_lines

	return None

def check_all_pages_exist(sim):
	expected_pages = find_keyword_value("goes_to_page", sim)
	actual_pages = find_keyword_value('page_name', sim)
	not_found_pages = []
	for i in expected_pages:
		if i not in actual_pages:
			not_found_pages.append(i)
	if len(not_found_pages) > 0: return not_found_pages

	return None

def check_pages_have_continuity(pages):
	non_continuous_pages = []
	continuous_indicators = ["popup_window", "pop_up_window", "choice", "goes_to_page"]
	
	for page in pages:
		found = None
		mismatched = []

		for indicator in continuous_indicators:
			if page.count(indicator) == 0:
				mismatched.append(indicator)

		if len(mismatched) == len(continuous_indicators):
			non_continuous_pages.append(page)

	if len(non_continuous_pages) > 0:
		page_names = []
		for page in non_continuous_pages:
			page_names.append(find_keyword_value("page_name", page))
	
		return page_names

	return None


def get_all_media(all_lines):
	medias = []

	for media in re.findall(r".*media.*=.*",all_lines):
		medias.append(strip_braces(re.findall("{.*}", media)[0]))

	return medias

def split_key_value(line):
	split = line.split("=")

	if len(split) == 1:
		return None
	else:
		return split[0].strip(), split[1].lstrip() # key, value

def get_text(line_number, line, lines):
	if lines[line_number].count("}") != 1:
		return strip_braces(select_until(line_number, lines, "}"))
	else:
		return strip_braces(line)

def find_keyword_value(keyword, sim):
	results = []
	for i, line in enumerate(sim.splitlines()):
		if keyword in line and "=" in line:
			if "}" not in line:
				text = select_until(i, sim, "}")
			else:
				text = strip_braces(re.findall("{.*}", line)[0])

			results.append(text)

	if len(results) == 1:
		return results[0]

	if len(results) > 1:
		return results

	return None

def select_until(line_number, lines, item, count = 1):
	full = ""
	counter = 0

	for i, line in enumerate(lines[line_number+1:]):
		if item not in line:
			full += line + "\n" 
		else:
			full += line + "\n"
			counter += 1
			if counter == count: break

			continue

	return full

def strip_braces(content):
	return content.replace("{", "").replace("}","")

def clean_comments(sim):
	lines = sim.splitlines()
	comment_lines = []
	for i,line in enumerate(lines):
		if "#" in line:
			if "}" in line:
				if line.index("}") < line.index("#"):
					sim = sim.replace(line, line[0:line.index("#") - 1])
			else:
				sim = sim.replace(line, "")
	return sim
	
if __name__ == '__main__':
	the_file = argv[1]
	
	if not the_file:
		print("Please pass in a file path.")
		exit()

	with codecs.open(the_file, "r", 'utf-8') as f:
		sim = f.read()
		# errors = check_for_errors(sim)
		# if errors: 
		# 	for key in errors:
		# 		print(key + ":")
		# 		if isinstance(errors[key], list):
		# 			for value in errors[key]:
		# 				print(value)
		# 		else:
		# 			print(errors[key])
		# else:
		parse_sim(sim)