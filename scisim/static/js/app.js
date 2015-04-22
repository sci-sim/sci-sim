function onSuccessfulParsing (medias) {
	// the client will response with a list of media that needs to be uploaded.
	var template = "<p class='fileLabel'>filename:</p><span>Status: Not Uploaded Yet.</span> &nbsp; &nbsp; &nbsp; &nbsp;<input type='file' name='filename'>";

	medias = JSON.parse(medias);
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