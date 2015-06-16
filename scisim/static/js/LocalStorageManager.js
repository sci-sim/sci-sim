var LocalStorageManager = (function () {
    function LocalStorageManager() {
        if (LocalStorageManager._instance) {
            throw new Error("Error: Instantiation failed: Use LocalStorageManager.getInstance() instead of new.");
        }
        LocalStorageManager._instance = this;
    }
    LocalStorageManager.getInstance = function () {
        return LocalStorageManager._instance;
    };
    LocalStorageManager.prototype.setLastPageId = function (value) {
        localStorage.setItem(LocalStorageManager.LAST_PAGE_ID_KEY, value);
    };
    LocalStorageManager.prototype.getLastPageId = function () {
        return localStorage.getItem(LocalStorageManager.LAST_PAGE_ID_KEY);
    };
    LocalStorageManager.prototype.setPageId = function (value) {
        localStorage.setItem(LocalStorageManager.PAGE_ID_KEY, value);
    };
    LocalStorageManager.prototype.getPageId = function () {
        return localStorage.getItem(LocalStorageManager.PAGE_ID_KEY);
    };
    LocalStorageManager.prototype.setUserChoices = function (value) {
        localStorage.setItem(LocalStorageManager.USER_CHOICES_KEY, JSON.stringify(value));
    };
    LocalStorageManager.prototype.getUserChoices = function () {
        return JSON.parse(LocalStorageManager.USER_CHOICES_KEY);
    };
    LocalStorageManager._instance = new LocalStorageManager();
    LocalStorageManager.PAGE_ID_KEY = 'page_id';
    LocalStorageManager.LAST_PAGE_ID_KEY = 'last_page_id';
    LocalStorageManager.USER_CHOICES_KEY = 'choices_made';
    return LocalStorageManager;
})();
