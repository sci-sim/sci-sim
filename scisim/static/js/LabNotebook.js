/* global ListContainer */
var LabNotebook = function($selector){
	this.$list = $selector;
	this.$list.addClass("hidden"); // TODO: find a way to inherit while executing the constructor
	this.init();
};

LabNotebook.prototype = Object.create(ListContainer.prototype);

LabNotebook.prototype.init = function(){
	$('.create-note').click(this.addNoteField.bind(this));
	$('body').click(this.removeInput.bind(this));
};

LabNotebook.prototype.addNoteField = function(e){
	var field = "<li class='note-creator'><input class='form-control' type='text' name='newNote' placeholder='New Note'><button id='add' class='btn btn-default'>Add</button><button id='cancel' class='btn btn-default'>Cancel</button></li>";
	
	console.log($('.labenotebook').children())
	$('.labenotebook').append($(field));
	console.log($('.labenotebook').children())
	
	
	$('.note-creator #add').click(function(){
		var text = field.find('input').val();
		this.add(text);
		this.removeInput();
	}.bind(this));
	
	$('.note-creator #cancel').click(function(e){
		this.removeInput();
	}.bind(this));
};

LabNotebook.prototype.removeInput = function(){
	this.$list.find('input').parent().remove();
};