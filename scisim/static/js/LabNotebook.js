/* global ListContainer */
var LabNotebook = function($selector){
	this.$list = $selector;
	this.$list.addClass("hidden"); // TODO: find a way to inherit while executing the constructor
	this.init();
};

LabNotebook.prototype = Object.create(ListContainer.prototype);

LabNotebook.prototype.init = function(){
	$('.create-note').click(this.addNoteField.bind(this));
};

LabNotebook.prototype.addNoteField = function(e){
	var field = $("<li class='note-creator'><input class='form-control' type='text' name='newNote' placeholder='New Note'><button class='btn btn-default'>Add</button></li>");
	this.$list.append(field);
	
	$('.note-creator .btn').click(function(e){
		var text = field.find('input').val();
		this.add(text);
		this.removeInput();
	}.bind(this));	
};

LabNotebook.prototype.removeInput = function(){
	this.$list.find('input').parent().remove();
};