from sys import argv, exit
from scisim.models import *
from scisim import next_id
import re

# fetches everything we need to get going
def setup():
	pass

def parse_sim(sim_template):
	# reg = re.match(r'\[([\s\S]*?)\]',sim_template, re.MULTILINE)
	page_re = re.compile(r'page .* = .* \[([\s\S]*?)\]',re.DOTALL|re.VERBOSE)
	pages = page_re.findall(sim_template)

	sim_re = re.compile(r'simulation_name.*')

	for page in pages:

def find_keyword(text, keyword, func):
	expr = re.compile(keyword + '.*=', flags)
	words = findall(expr)

	if len(words) > 0:
		func(words)
		return True
	else:
		return None

def process_page(page_text, sim):
	page = None
	order = 0
	all_lines = page_text.splitlines(page_text)

	for i, line in enumerate(all_lines):
		page_id++

		try:
			keyword, content = split_key_value(line)
		except Exception, e:
			# this line doesn't have content we want, so go to the next one
			continue

		if keyword == "page_name":
			page = Page(sim=sim, title=content)
			db.session.add(page)
			db.session.commit()

		else if keyword == "heading_big":
			add_section(i, all_lines, order, content, "big")
			order++

		else if keyword == "heading_small":
			add_section(i, all_lines, order, content, "small")
			order++

		else if keyword == "text":
			add_section(i, all_lines, order, content, "regular")
			order++

		else if keyword == "minimum_choices" or keyword == "choice_minimum":
			add_page_modifier(page, keyword, content)

		else if keyword == "choice":
			lines = select_until(i, all_lines, "]")
			parse_choice(lines, page)

def parse_choice(lines, page):
	type = None
	text = None
	destination = None

	for i, line in enumerate(lines):

		if "prompt" in line or "textbox" in line:
			type = "text"
			text = get_text(i, line, lines)

		else if "binary" in line:
			type = "binary"
			text = get_text(i, line, lines)

		else if "goes_to_page" in line:
			destination = get_text(i , line, lines)

	print("Adding a choice to the database")
	db.session.add(Choice(type=type, text=text, destination=destination))
	db.session.commit()

def add_section(line_number, all_lines, order, content, size):
	print("Adding section")
	content = get_text(line_number, content, all_lines)
	content = content

	if size == "small":
		tags = "<h3>content</h3>"
	else if size == "big":
		tags = "<h1>content</h1>"
	else if size == "regular":
		tags = "<p>content</p>"

	content = tags.replace("content", content)
	db.session.add(Section(show=True, order=order, content=content))
	db.session.commit()

def add_page_modifier(page, name, value):
	print("adding a page modifier")
	db.session.add(Page_Modifier(name=name, value=value, page=page))
	db.session.commit()

def split_key_value(line):
	split = line.split("=")

	if len(split) == 1:
		return None
	else:
		return split[0].rstrip(), split[1].lstrip() # key, value

def get_text(line_number, line, all_lines):
	if is_multiline(line):
		return select_until(line_number, all_lines, "}").replace("{", "").replace("}","")
	else:
		return line.replace("{", "").replace("}","")

def is_multiline(line):
	if "}" not in line:
		return None
	else:
		return True

def select_until(line_number, lines, item):
	full = ""
	for line in lines[line_number+1:]:
		if item not in line:
			full += line
		else:
			break

	return full

if __name__ == '__main__':
	the_file = argv[1]
	
	if not the_file:
		print("Please pass in a file path.")
		exit()

	with open(the_file, "r") as f:
		sim = f.read()
		parse_sim(sim)
