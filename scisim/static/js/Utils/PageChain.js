var PageChain = function(){
	this.currentPointer = -1;
	this.chain = [];
    this.activePointer = -1;
    this.returnNext = false;
    this.headId = -1;
    this.patient_choices_for_ret;};

PageChain.prototype.add = function (page) {
	if(this.chain.length >= 1){ // the first page is where simulation starts
		for (var i = 0; i < this.chain.length; i++) {
			if(_.isEqual(this.chain[i], page)){
				this.currentPointer = i;
                this.activePointer = this.currentPointer;
				return;
			}
		}
	}
	
	this.chain.push(page);
	this.currentPointer = this.chain.length - 1;
    if(this.activePointer == this.currentPointer - 1) {
        this.activePointer = this.currentPointer;
    }
};

PageChain.prototype.updateContext = function(context){
	for (var i = 0; i < this.chain.length; i++) {
		if(this.chain[i].id === context.id){
			this.chain[i] = context;
		}
	}
	
	return false;
};

PageChain.prototype.findById = function(id){
	for (var i = 0; i < this.chain.length; i++) {
		if(this.chain[i].id === id){
			return this.chain[i];
		}
	}
	
	return false;
};

PageChain.prototype.findChainLinkById = function(id){
    for (var i = 0; i < this.chain.length; i++) {
        if(this.chain[i].id == id){
            return i;
        }
    }
    
    return false;
};

PageChain.prototype.goBack = function(){
	var current = this.currentPointer;
	this.currentPointer -= 1;
    this.activePointer = this.currentPointer;
	
	this.revivePage(current, this.currentPointer);
};

PageChain.prototype.goForward = function(){
	var current = this.currentPointer;
	this.currentPointer += 1;
    this.activePointer = this.currentPointer;
	
	this.revivePage(current, this.currentPointer);
};

PageChain.prototype.revivePage = function(newPage){
    renderer.composePage(this.chain[newPage]);
    this.activePointer = newPage;
    };

PageChain.prototype.isThisLastPage = function (currentPage, currentDest) {
    if (this.currentPointer >= 0 && this.getLastPage().id != currentPage.id) {
        return this.chain[this.currentPointer].id;
    } else {
        return currentDest;
    }
};

PageChain.prototype.getLastPage = function () {
	return this.chain[this.activePointer - 1];
};

PageChain.prototype.getLastPageInChain = function () {
    return this.chain[this.currentPointer];
}

PageChain.prototype.getActivePage = function () {
    return this.chain[this.activePointer];
};

PageChain.prototype.updateActivePage = function (context) {
	for (var i = 0; i < this.chain.length; i++) {
		if (this.chain[i].id === context.id) {
			this.chain.remove(i);
			this.add(context);
			return;
		}
	}
};

PageChain.prototype.count = function(){
	return this.chain.length;
};