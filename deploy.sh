echo Compressing Files...
tar -zcvf latest.tar.gz ./*

echo Copying compressed files to server...
scp latest.tar.gz root@104.131.26.12:/var/www/sci

echo Executing commands on the server...
ssh root@104.131.26.12 <<'ENDSSH'
	cd /var/www/sci
	tar -zcvf archive.tar.gz src/* src/.git
	cd src
	rm -rf ./*
	rm -rf src/.git
	tar -zxvf ../latest.tar.gz
	pip install -r requirements
	#python db_create.py
	python sim_parser.py new_sim_template.txt
ENDSSH

echo Done!