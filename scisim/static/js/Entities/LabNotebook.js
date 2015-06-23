/* global ListContainer */
var LabNotebook = function($selector){
	this.$list = $selector;
	this.$list.addClass("hidden"); // TODO: find a way to inherit while executing the constructor
	this.init();
};

LabNotebook.prototype = Object.create(ListContainer.prototype);

LabNotebook.prototype.init = function(){
	$('.create-note').click(this.addNoteField.bind(this));
	$('body').click(function(e) {
		if (!$(e.target).is('.create-note, input, .note-creator')) {
			this.removeInput();
		}
	}.bind(this));
};

LabNotebook.prototype.addNoteField = function(e){
	var field = $("<li class='note-creator'><input class='form-control' type='text' name='newNote' placeholder='New Note'><button id='add' class='btn btn-default'>Add</button><button id='cancel' class='btn btn-default'>Cancel</button></li>");
	$('.labenotebook').append(field);
	$('.labenotebook').scrollTop($('.labenotebook')[0].scrollHeight);
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

LabNotebook.prototype.addButtonToLast = function(chainNum) {
       this.$list.children().last().append("<button id='"+chainNum+"' class='btn btn-default btn-return' >Change my choice</button>");
}