import re
import urllib.request


TEMPLATE_FILE = "new_sim_template.txt"
WRITE_TO_PATH = "scisim/static/audio/"
MAP = {'76': "lungs_healthy",
       '73': "lungs_unhealthy",
       '32': "heart_healthy",
       '7': "heart_unhealthy"}


with open(TEMPLATE_FILE) as f:
    template = f.read()
    to_download = {}
    regex = "media\s?=\s?{(http[^}]+caseID=(\d+))}"
    for url, caseID in re.findall(regex, template):
        to_download[caseID] = [url]
        print(caseID)
    for caseID in to_download:
        url = to_download[caseID][0]
        html = urllib.request.urlopen(url).read().decode()
        regex = "mp3: '([^']*)"
        for mp3_file in re.findall(regex, html):
            to_download[caseID].append(mp3_file)
        if len(re.findall(regex, html)) == 0:
            print(url + " mp3 not found")
        else:
            mp3_file = to_download[caseID][1]
            data = urllib.request.urlopen(mp3_file).read()
            new_filename = MAP[caseID] + "_" + mp3_file.split('/')[-1]
            with open(WRITE_TO_PATH + new_filename, 'wb') as f:
                f.write(data)
                print("wrote to", WRITE_TO_PATH + new_filename)
                template = template.replace(url, new_filename)

with open(TEMPLATE_FILE, 'w') as f:
    f.write(template)

