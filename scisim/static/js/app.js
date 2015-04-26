function onSuccessfulParsing (data) {
	// the client will response with a list of media that needs to be uploaded.
	data = JSON.parse(data);

	if (data.hasOwnProperty("errors")){
		displayErrors(data.errors);
	}else{
		getMediaInputs(data.medias)
	}	
}

function displayErrors(errors){
	var errors = errors;
	var html  = "";
	for(var error in errors){
		var identifier = ""; // for the tooltip explanation

		if(error.search("Missing closing") > 0){
			identifier += "closing_tag_error";
		}else if(error.search("do not exist") > 0){
			identifier += "page_not_exists";
		}else if(error.search("continuity errors") > 0){
			identifier += "continuity_error";
		}else if(error.search("essential keywords") > 0){
			identifier += "essential_keyword_errors";
		}

		html += "<h3 class='help "+identifier+"'>" + error + "</h3>";
		for (var i = 0; i < errors[error].length; i++) {
			html += "<p>" + $('<div>').text(errors[error][i]).html() + "</p>";
		}
	}

	$('.continuity_error').tooltip({"title": "tooltip text!"})

	$('.reset').removeClass("hidden")
	$('.reset').click(function(){window.location.reload()})

	$(".errors").removeClass("hidden").append($(html));
}

function getMediaInputs(medias){
	var template = "<p class='fileLabel'>filename:</p><span>Status: Not Uploaded Yet.</span> &nbsp; &nbsp; &nbsp; &nbsp;<input type='file' name='filename'>";
	
	medias = medias.filter(function(item, pos, self) {
		return self.indexOf(item) == pos; // filters the duplicates
	});

	for (var i = 0; i < medias.length; i++) {
		var mediaTemp = template.replace(/filename/gi, medias[i]);
		var container = document.querySelector(".mediaUpload");

		container.className = container.className.replace("hidden", "");
		// attach the new inputs for the media to the DOM
		container.innerHTML += mediaTemp;
	};

	// now we need to attach listeners for when the user uploads the media
	var inputs = document.querySelectorAll(".mediaUpload input[type=file]");
	for (var i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener('change', processMediaUpload);
	};
}

function processMediaUpload(e){
	var inputs = document.querySelectorAll('input[type=file]');

	var file  = e.target.files[0];
	var formData = new FormData();

	formData.append("file", file);

	var xhr = new XMLHttpRequest(); // because reqwest doesn't seem to have an option for files...
	xhr.open("POST","/api/media/upload", true);

	xhr.onload = function(){
		if (xhr.status === 200) {
			// this is the span that displays the status
			e.target.previousElementSibling.innerHTML = "Status: Uploaded";
			e.target.previousElementSibling.className += "success";
		} else {
			alert('An error occurred!');
			e.target.previousElementSibling.innerHTML = "Status: Upload Failed";
			e.target.previousElementSibling.className += "failed";
		}
	}

	xhr.send(formData);
}

function processSimUpload(e){
	var file  = e.target.files[0];

	// check if the file is the correct type
	if(file.type != "text/plain"){
		alert("Please enter a plain text file")
		return false;
	}

	var reader = new FileReader();

	// this is what we're gonna do when the file is read
	reader.onload = function(e){
		// gets the file contents..but only for text
		var fileContents = e.target.result

		reqwest({
			url: "/api/simulations/create",
			method: "POST",
			data: {"contents": fileContents},
			success: onSuccessfulParsing,
			error: function(err){
				alert("Oh no! An error occurred. Please reload the page and try again.");
			}
		});
	}

	reader.readAsText(file);
}

document.querySelector("input").addEventListener("change", processSimUpload);