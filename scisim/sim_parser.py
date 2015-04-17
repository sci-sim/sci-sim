from sys import argv, exit
from scisim.models import *
from scisim import next_id
import re

def debug(exp):
	print("---------------------")
	print(exp)
	print("---------------------")
	exit()

def parse_sim(sim_template):
	pages = re.findall(r'\[([\s\S]*?)\]',sim_template, re.MULTILINE)
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

		# print(line)
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

		elif keyword == "pop_up_window":
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
	db.session.add(Page_Modifier(name=name, value=value, page_id=page.id))
	db.session.commit()

def add_page_action(page, name, value):
	print("adding a page action")
	db.session.add(Page_Action(name=name, value=value, page_id=page.id))
	db.session.commit()

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
	for line in sim.splitlines():
		if keyword in line:
			return strip_braces(re.findall("{.*}", line)[0])

	return None

def select_until(line_number, lines, item):
	full = ""
	for line in lines[line_number+1:]:
		if item not in line:
			full += line
		else:
			break

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
		parse_sim(sim)