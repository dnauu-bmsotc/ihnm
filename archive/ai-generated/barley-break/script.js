// Создаем массив с числами от 1 до 15
var numbers = Array.from({ length: 15 }, (_, i) => i + 1);

// Добавляем пустую клетку в массив
numbers.push(null);

// Получаем ссылки на элементы HTML
var board = document.querySelector('.board');
var tiles = document.querySelectorAll('.tile');
var newGameBtn = document.querySelector('#new-game-btn');

// Функция, которая перемешивает числа в массиве
// Хорошо, вот переписанная функция shuffle, которая использует алгоритм Дейкстры\
// и гарантированно генерирует решаемую начальную конфигурацию:
function shuffle(numbers) {
    var n = numbers.length;
    for (var i = n - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = numbers[i];
      numbers[i] = numbers[j];
      numbers[j] = temp;
    }
  
    // Проверяем, является ли текущая конфигурация решаемой
    var inversions = 0;
    for (var i = 0; i < n - 1; i++) {
      for (var j = i + 1; j < n; j++) {
        if (numbers[i] !== null && numbers[j] !== null && numbers[i] > numbers[j]) {
          inversions++;
        }
      }
    }
    var blankIndex = numbers.indexOf(null);
    var blankRow = Math.floor(blankIndex / 4) + 1;
    var isSolvable = (inversions + blankRow) % 2 === 0;
  
    // Если текущая конфигурация нерешаема, перетасовываем еще раз
    if (!isSolvable) {
      shuffle(numbers);
    }
  }
  

// Функция, которая обновляет игровое поле
function updateBoard() {
    for (var i = 0; i < tiles.length; i++) {
        var number = numbers[i];
        var tile = tiles[i];
        tile.textContent = number;
        tile.classList.remove('empty');
        if (number === null) {
            tile.classList.add('empty');
        }
    }
}

// Функция, которая проверяет, является ли текущее расположение клеток выигрышным
function checkWin() {
    for (var i = 0; i < numbers.length - 1; i++) {
        if (numbers[i] !== i + 1) {
            return false;
        }
    }
    return true;
}

// Функция, которая обрабатывает клики по клеткам
function handleTileClick(event) {
    var clickedTile = event.target;
    var clickedTileIndex = Array.from(tiles).indexOf(clickedTile);
    var emptyTileIndex = numbers.indexOf(null);
    var distance = Math.abs(clickedTileIndex - emptyTileIndex);
    if (distance === 1 || distance === 4) {
        numbers[emptyTileIndex] = numbers[clickedTileIndex];
        numbers[clickedTileIndex] = null;
        updateBoard();
        if (checkWin()) {
            alert('Поздравляем! Вы победили!');
            }
        }
    }

    // Функция, которая запускает новую игру
    function startNewGame() {
    shuffle(numbers);
    updateBoard();
}

// Обработчики событий
newGameBtn.addEventListener('click', startNewGame);
board.addEventListener('click', handleTileClick);

// Запускаем новую игру при загрузке страницы
startNewGame();
   
