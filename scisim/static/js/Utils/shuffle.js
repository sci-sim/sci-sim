/**
 * Fisher-Yates shuffle implementation: http://bost.ocks.org/mike/shuffle/
 * @param  Array array Unshuffled array.
 * @return Array       Randomly shuffled array.
 */
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex--);
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
