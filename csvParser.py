from scisim.models import *
from csv import DictWriter
import re 

def getValueFromLog(log):
	text = log.content
	pattern = "Choice made:(.+)on the choice"
	exp = re.compile(pattern)
	result = exp.match(text)
	
	return result.group(1)
	
def getUserNameFromLog(log):
	return User.query.get(log.user_id).name
	
def getChoiceFromLog(log):
	text = log.content
	pattern = ".+on the choice with id: (.+) on page"
	exp = re.compile(pattern)
	result = exp.match(text)
	choiceId = result.group(1)
	if choiceId == "NoneType":
		 return Choice.query.get(choiceId).text
	return  "could not get choice text"
	
def getTimeFromLog(log):
	text = log.content
	pattern = ".+after time:.+(\d)"
	exp = re.compile(pattern)
	result = exp.match(text)
	
	return result.group(1)

def getPageFromLog(log):
	text = log.content
	pattern = ".+on page: (.+) after"
	exp = re.compile(pattern)
	result = exp.match(text)
	pageId = result.group(1)
	return Page.query.get(pageId).title + " (" + pageId + ")"

logs = Log.query.all()

with open("sci-data.csv", "a") as f:
	fields = ['user', 'choice', 'value', 'time (s)', 'page']
	w = DictWriter(f, fieldnames=fields)
	w.writeheader()
	for log in logs:
		data = {}
		data['choice'] = getChoiceFromLog(log)
		data['user'] = getUserNameFromLog(log)
		data['value'] = getValueFromLog(log)
		data['time (s)'] = getValueFromLog(log)
		data['page'] = getPageFromLog(log)
		
		w.writerow(data)