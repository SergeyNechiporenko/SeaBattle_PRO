//объект отображения результатов процесса игры (объект с ключами и значениями)
var view = { 
	displayMessage: function(msg){ // значение ключа - функция, которая передает свой параметр(msg) в innertext messageArea
		var messageArea = document.querySelector('#messageArea');
		messageArea.innerText = msg;
	},

	displayHit: function(location){ // значение ключа - функция, которая делает заливку ячейки(class="hit") диву с id="location", если ПОПАДАНИЕ
		var cell = document.getElementById(location);
		cell.setAttribute("class", "hit");
		cell.innerHTML = '';
	},

	displayMiss: function(location){ // значение ключа - функция, которая делает заливку ячейки(class="miss") диву с id="location", если ПРОМАХ
		var cell = document.getElementById(location); 
		cell.setAttribute("class", "miss");
		cell.innerHTML = '';
	}
};

// ОБЪЕКТ МОДЕЛИ ИГРЫ
var model = { 
	boardSize: 7, // длина поля (7 клеток)
	numShips: 3, // кол-во кораблей (3 шт.)
	shipLength: 3, // длина одного корабля (3 клетки)
	shipsSunk: 0, // кол-во сбитых кораблей (0 на старте игры)
	
	ships: [ // массив с кораблями и выстрелами по ним
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] }
	],

	// ПРОВЕРКА НА ПОПАДАНИЕ В КОРАБЛЬ
	fire: function(guess){ // значение ключа - функция, принимающая параметр (guess) и запускающая цикл for
		for(var i = 0; i < this.numShips; i++){ // кол-во итераций цикла ограничено кол-вом кораблей (3шт.)
			var ship = this.ships[i]; // создаем переменную корабля при каждой итерации массива ships
			var index = ship.locations.indexOf(guess); // сохраняем в переменную index локации корабля соответствующий попытке попадания по кораблю
			
			if (ship.hits[index] === "hit"){ // если в данном элементе массива уже есть hit
				view.displayMessage("Ты уже попал в эту локацию!");
				return true;
			} else if (index >= 0) { // если index соответствует локации корабля, т.е. равен 0, 1 или 2
				ship.hits[index] = "hit"; // то кладем в соответствующий элемент массива hits - значение "hit"
				view.displayHit(guess); // и вызываем bg с попаданием в корабль
				view.displayMessage("Ты подбил корабль!"); // и вызываем сообщение о попадании в корабль
			
				if (this.isSunk(ship)) { // При попадании делаем проверку потоплен ли корабль
					view.displayMessage("Ты потопил корабль!");
					this.shipsSunk++;
				}
				return true;
			}
		}
		view.displayMiss(guess); // вызываем bg с промахом
		view.displayMessage('Ты промазал!'); // вызываем сообщение о промахом
		return false;
	},

	// ПРОВЕРКА ПОТОПЛЕН ЛИ КОРАБЛЬ
	isSunk: function(ship) { // значение ключа - ф-ция, которая запускает цикл и проверяет, что массив hits заполнен
		for (var i = 0; i < this.shipLength; i++) {
			if(ship.hits[i] !== "hit"){
				return false;
			}
		}
		return true;
	},

	// МЕТОД, ГЕНЕРИРУЮЩИЙ ЛОКАЦИИ КОРАБЛЕЙ
	generateShipLocations: function() {
		var locations;
		for (var i = 0; i < this.numShips; i++) {
			do {
				locations = this.generateShip();
			} while (this.collision(locations));
			this.ships[i].locations = locations;
		}
		console.log("Ships array: ");
		console.log(this.ships);
	},

	// МЕТОД, СОЗДАЮЩИЙ ОДИН КОРАБЛЬ
	generateShip: function() {
		var direction = Math.floor(Math.random() * 2);
		var row, col;

		if (direction === 1) { // horizontal
			row = Math.floor(Math.random() * this.boardSize);
			col = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
		} else { // vertical
			row = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
			col = Math.floor(Math.random() * this.boardSize);
		}

		var newShipLocations = [];
		for (var i = 0; i < this.shipLength; i++) {
			if (direction === 1) {
				newShipLocations.push(row + "" + (col + i));
			} else {
				newShipLocations.push((row + i) + "" + col);
			}
		}
		return newShipLocations;
	},

	//МЕТОД, ПРОВЕРЯЮЩИЙ, ЧТО ОДИН КОРАБЛЬ НЕ ПЕРЕКРЫВАЕТ ДРУГОЙ
	collision: function(locations) {
		for (var i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
			for (var j = 0; j < locations.length; j++) {
				if (ship.locations.indexOf(locations[j]) >=0) {
					return true;
				}
			}
		}
		return false;
	}
};


var controller = {
	guesses: 0,

	processGuess: function(guess){
		var location = parceGuess(guess);
		if (location) {
			this.guesses++;
			var hit = model.fire(location);
			if (hit && model.shipsSunk === model.numShips) {
				view.displayMessage('Поздравляю! Вы потопили все корабли за ' + this.guesses + ' выстрелов!');
			}
		}
	}
}

function parceGuess(guess){
	var alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

	if (guess === null || guess.length !== 2){
		alert('Вы ввели неверные координаты');
	}else{
		firstChar = guess.charAt(0);
		var row = alphabet.indexOf(firstChar);
		var column = guess.charAt(1);

		if (isNaN(row) || isNaN(column)) {
			alert('Вы ввели неверные координаты');
		}else if(row < 0 || row >= model.boardSize || column < 0 || column >= model.boardSize){
			alert('Вы ввели неверные координаты');
		}else{
			return row + column;
		}
	}
	return null;
}

function init() {
	var fireButton = document.getElementById("fireButton");
	fireButton.onclick = handleFireButton;
	var guessInput = document.getElementById("guessInput");
	guessInput.onkeypress = handleKeyPress;

	model.generateShipLocations();
}

function handleFireButton(){
	var guessInput = document.getElementById("guessInput");
	var guess = guessInput.value;
	controller.processGuess(guess);

	guessInput.value = "";
}

function handleKeyPress(e){
	var fireButton = document.getElementById("fireButton");
	if (e.keyCode === 13){
		fireButton.click();
		return false;
	}
}

window.onload = init;