from sys import argv, exit
from scisim.models import *
from scisim import next_id
import re

def debug(*exps):
	for exp in exps:
		print("---------------------")
		print(exp)
		print("---------------------")
	exit()

def parse_sim(sim_template):
	sim_template = re.sub("#.*", "", sim_template)
	pages = get_all_pages(sim_template)
	# page_re = re.compile(r'page .* = .* \[([\s\S]*?)\]',re.DOTALL|re.VERBOSE)
	# pages = page_re.findall(sim_template)

	simulation_name = find_keyword_value("simulation_name", sim_template)
	password = find_keyword_value("password", sim_template)
	description = find_keyword_value("description", sim_template)
	preview_picture = find_keyword_value("preview_picture", sim_template)

	sim = Simulation(title=simulation_name, desc=description, password=password, preview_image_filename=preview_picture)

	db.session.add(sim)
	db.session.commit()

	print("Simulation added.")

	page_base = (db.engine.execute("select count() from simulations").fetchone()[0] + 1) * 100

	for page in pages:
		process_page(page, sim, page_base)
		page_base += 1

def get_all_pages(sim):
	all_lines = sim.splitlines()
	pages = []
	for i, line in enumerate(all_lines):
		if re.match(r'.*page\s*=\s*\[', line): # had to get real specific here.
			pages.append(page_loop(i, all_lines))
			

	return pages

def page_loop(start_line, all_lines):
	page = ""
	choice_counter = 0 # instead of counting the text directly
	end_counter = 0

	for i,line in enumerate(all_lines[start_line:]):
		line = line + "\n"

		if "choice" in line and "choice_" not in line:
			choice_counter += 1

		if "]" in line:
			end_counter += 1

			if (end_counter - 1) == choice_counter:
				page += line
				break

			page += line
			continue

		page += line

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
			add_section(i, all_lines, order, content, "big")
			order += 1

		elif keyword == "heading_small":
			print("found small heading")
			add_section(i, all_lines, order, content, "small")
			order += 1

		elif keyword == "text":
			print("found text")
			add_section(i, all_lines, order, content, "regular")
			order += 1

		elif keyword == "media":
			print("Found media")
			add_section(i, all_lines, order, "media " + content)

		elif keyword == "minimum_choices" or keyword == "choice_minimum" or keyword == "choice_limit":
			print("found choices")
			add_page_modifier(page, keyword, content)

		elif keyword == "choice_limit_page" or keyword == "minimum_choices_reached_page":
			print("adding choice")
			add_page_modifier(page, keyword, content)

		elif keyword == "minimum_choices_reached_page":
			print("Fond min choice page")
			add_page_action(page, keyword, content)

		elif keyword == "choice":
			print("foune choice")
			lines = select_until(i, all_lines, ")")
			parse_choice(lines, page)

		elif keyword == "add_to_notebook":
			add_page_action(page, keyword, content)

		elif keyword == "pop_up_window" or keyword == "popup_window":
			add_page_modifier(page, keyword, content)

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
	db.session.add(Choice(type=type, text=text, destination=destination))
	db.session.commit()

def add_section(line_number, all_lines, order, content, size=None):
	print("Adding section")
	content = get_text(line_number, content, all_lines)
	content = content

	if size == "small":
		tags = "<h3>content</h3>"
	elif size == "big":
		tags = "<h1>content</h1>"
	elif size == "regular":
		tags = "<p>content</p>"

	if size: # we do this check to make sure that there's no media here. If there's media, then size won't be passed in
		content = tags.replace("content", content)

	db.session.add(Section(show=True, order=order, content=strip_braces(content)))
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
	errors = {}
	
	# check to make sure that all keywords have closing tags
	tag_errors = check_all_tags_close(sim)
	# check to make sure all pages that you go to exist
	existant_errors = check_all_pages_exist(sim)
	# make sure all pages have either popup_menu, choices, or goes_to_page
	pages = re.findall(r'\[([\s\S]*?)\]', sim, re.MULTILINE)
	continuiry_errors = check_pages_have_continuity(pages)

	if tag_errors:
		errors['tag_errors'] = tag_errors
	if existant_errors:
		errors['pages_dont_exist'] = existant_errors
	if tag_errors:
		errors['all_pages_continue'] = tag_errors

	if len(errors) > 0:
		return errors

	return None


def check_all_tags_close(sim):
	error_lines = []
	lines = sim.splitlines();

	# first we're going to check if the number of opening and closing tags are the same.
	if sim.count("{") != sim.count("}") or sim.count("[") != sim.count("]"):
		for i,line in enumerate(lines):
			# if not, we're going to check all the assignments to see if there's an opening tag
			if "=" in line:
				if "{" not in line and "[" not in line and "}" not in line:
					error_lines.append('Missing opening symbol on line: ' +  line)

				# now we check to see if there is a closing tag
				if "{" in line and "}" not in line:
					selection_till_closing_tag = select_until(i, lines, "}")
					if selection_till_closing_tag.count("{") > 0:
						error_lines.append('Missing closing tag ( } ) on line: ' + line)

				if "[" in line and "page" in line:
					selection = select_until(i, lines, "page")

					number_of_choices = selection.count("choice")
					number_of_closing_tags = selection.count("]")
					
					if number_of_choices == number_of_closing_tags:
						error_lines.append("Missing closing tag ( ] ) on line: " + line)

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
		for indicator in continuous_indicators:
			if page.count(indicator) == 0:
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

# Helpers
def split_key_value(line):
	split = line.split("=")

	if len(split) == 1:
		return None
	else:
		return split[0].strip(), split[1].lstrip() # key, value

def get_text(line_number, line, all_lines):
	if is_multiline(line):
		return strip_braces(select_until(line_number, all_lines, "}"))
	else:
		return strip_braces(line)

def is_multiline(line):
	if "}" in line:
		return None
	else:
		return True

def find_keyword_value(keyword, sim):
	results = []
	for line in sim.splitlines():
		if keyword in line and "=" in line:
			results.append(strip_braces(re.findall("{.*}", line)[0]))

	if len(results) == 1:
		return results[0]

	if len(results) > 1:
		return results

	return None

def select_until(line_number, lines, item, count = 1):
	full = []
	counter = 0

	for i, line in enumerate(lines[line_number+1:]):
		if item not in line:
			full.append(line)
		else:
			# debug(lines[line_number + 1 + i-1], lines[line_number + 1 + i], lines[line_number + 1 + i + 1])
			full.append(line) # add that last line
			# debug(full)
			counter += 1
			if counter == count: break

			continue

	return full

def strip_braces(content):
	return content.replace("{", "").replace("}","")

if __name__ == '__main__':
	the_file = argv[1]
	
	if not the_file:
		print("Please pass in a file path.")
		exit()

	with open(the_file, "r") as f:
		sim = f.read()
		errors = check_for_errors(sim)
		if errors: 
			print("Errors:")
			print(errors)
			exit()
		print("success")
		# parse_sim(sim)