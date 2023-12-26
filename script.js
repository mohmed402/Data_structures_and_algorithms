let data;
let timer = [];
let limit = 10;
let firstSearch = false;
let finalBookList = [];
let filterArrayOne = [];
let secoundArray = [];
let endArray = [];
let storedData;

document.getElementById("bookPackage").addEventListener("change", readFile);

document.querySelector(".moreBtn").addEventListener("click", () => {
  if (limit < endArray.length) {
    limit += 10;
    bookElement(endArray);
  }
});
document.querySelector(".lessBtn").addEventListener("click", () => {
  if (limit != 10) {
    limit -= 10;
    bookElement(endArray);
  }
});

async function readFile() {
  try {
    let bookPackage = document.getElementById("bookPackage").value;
    const response = await fetch(`books/${bookPackage}`);
    const content = await response.text();
    parseCSV(content);
  } catch (error) {
    console.error("Error reading the file:", error);
  }
}

function parseCSV(content) {
  let totalBooks = document.querySelector(".totalBook");
  const rows = content.split("\n");
  const DATAS = rows.map((row) => row.split(","));
  storedData = DATAS;
  firstSearch = false;
  let data;
  console.log(storedData);
  totalBooks.textContent = `${storedData.length} Book found`;
}

function bookElement(data) {
  let books = document.querySelector(".books");
  books.innerHTML = "";
  data
    .slice(0, limit)
    .map((book) =>
      createBookElement(book[0], book[3], book[1], book[2], book[4])
    );
}

function createBookElement(isbn, year, title, author, publisher) {
  // Create main div
  const bookDiv = document.createElement("div");
  bookDiv.classList.add("book");

  // Create groupOneBook div
  const groupOneBookDiv = document.createElement("div");
  groupOneBookDiv.classList.add("groupOneBook");

  // ISBN
  const isbnLabel = document.createElement("label");
  isbnLabel.setAttribute("for", "isbn");
  isbnLabel.textContent = "ISBN:";
  groupOneBookDiv.appendChild(isbnLabel);

  const isbnParagraph = document.createElement("p");
  isbnParagraph.classList.add("isbn");
  isbnParagraph.textContent = isbn;
  groupOneBookDiv.appendChild(isbnParagraph);

  // Year
  const yearLabel = document.createElement("label");
  yearLabel.setAttribute("for", "year");
  yearLabel.textContent = "Year:";
  groupOneBookDiv.appendChild(yearLabel);

  const yearParagraph = document.createElement("p");
  yearParagraph.classList.add("year");
  yearParagraph.textContent = year;
  groupOneBookDiv.appendChild(yearParagraph);

  // Append groupOneBookDiv to bookDiv
  bookDiv.appendChild(groupOneBookDiv);

  // Title
  const titleLabel = document.createElement("label");
  titleLabel.setAttribute("for", "title");
  titleLabel.textContent = "Title:";
  bookDiv.appendChild(titleLabel);

  const titleParagraph = document.createElement("p");
  titleParagraph.textContent = title;
  bookDiv.appendChild(titleParagraph);

  // Author
  const authorLabel = document.createElement("label");
  authorLabel.setAttribute("for", "author");
  authorLabel.textContent = "Author:";
  bookDiv.appendChild(authorLabel);

  const authorParagraph = document.createElement("p");
  authorParagraph.textContent = author;
  bookDiv.appendChild(authorParagraph);

  // Publisher
  const publisherLabel = document.createElement("label");
  publisherLabel.setAttribute("for", "publisher");
  publisherLabel.textContent = "Publisher:";
  bookDiv.appendChild(publisherLabel);

  const publisherParagraph = document.createElement("p");
  publisherParagraph.textContent = publisher;
  bookDiv.appendChild(publisherParagraph);

  // return bookDiv;
  let books = document.querySelector(".books");
  books.appendChild(bookDiv);
}

document.querySelector(".searchBtn").addEventListener("click", () => {
  let searchInput = document.querySelector(".searchInput").value;
  let isValid = inputCheck(searchInput);
  if (!isValid && searchInput != "") {
    alert("Please enter a valid character");
    return;
  }
  let loaderElement = document.querySelector(".loaderSec");
  let booksElm = document.querySelector(".books");
  booksElm.style.display = "none";
  loaderElement.style.display = "flex";

  setTimeout(() => {
    sortMethod();
  }, 1000);
});

async function sortMethod() {
  limit = 10;
  timer = [];

  filterArrayOne = [];
  secoundArray = [];
  endArray = [];

  let booksElm = document.querySelector(".books");
  let loaderElement = document.querySelector(".loaderSec");

  await getTime();

  if (!firstSearch) {
    data = await sort(storedData);
  }
  firstSearch = true;

  let searchInput = document.querySelector(".searchInput").value;
  let inputArray = wordToArray(searchInput);

  let searchType = Number(document.getElementById("searchType").value);
  let searchInputLength = searchInput.length;

  finalBookList = [];

  if (inputArray.length >= 1) {
    await processArray(data.slice(), inputArray[0], searchType, filterArrayOne);
    console.log(filterArrayOne);
  }
  if (inputArray.length >= 2) {
    await processArray(filterArrayOne, inputArray[1], searchType, secoundArray);
    console.log(secoundArray);
  }

  let arrayToUse = secoundArray.length ? secoundArray : filterArrayOne;
  let arrayToUseLength = arrayToUse.length > 20000 ? 20000 : arrayToUse.length;
  for (let i = 0; i < arrayToUseLength; i++) {
    if (
      arrayToUse[i] &&
      Array.isArray(arrayToUse[i]) &&
      arrayToUse[i].length >= 2
    ) {
      let bookData = arrayToUse[i][searchType];
      if (bookData) {
        let lengthOfData = bookData.length;
        let index = 0;

        for (let x = 0; x < lengthOfData; x++) {
          if (bookData[x].toLowerCase() == searchInput[index]) {
            index++;
            if (endArray.length > 10) {
              bookElement(endArray);
            }

            if (index === searchInputLength) {
              endArray.push(arrayToUse[i]);
              break;
            }
          } else {
            index = 0;
          }
        }
      }
    }
  }
  await getTime();

  loaderElement.style.display = "none";
  booksElm.style.display = "flex";
  let ARRAY = inputArray.length == "" ? data : endArray;
  bookElement(ARRAY);
  updateUI();

  console.log("finished");
}

function processArray(array, input, searchType, resultArray) {
  for (let j = 0; j < array.length; j++) {
    let numLength;
    if (array[j][searchType] !== undefined) {
      numLength = array[j][searchType].length;
    }

    for (let y = 0; y < numLength; y++) {
      recursiveFunction(
        array,
        input,
        0,
        array.length - 1,
        y,
        searchType,
        resultArray
      );
    }
  }
}

function updateUI() {
  let timerElement = document.querySelector(".time");
  let info = document.querySelector(".info");
  info.style.display = "block";
  console.log(endArray);
  let totalBooks = document.querySelector(".totalBook");
  totalBooks.textContent = `${endArray.length} Book found`;

  if (timer) {
    timerElement.textContent = `${timer[1] - timer[0]} milliseconds`;
  }
}

function binarySearch(a, item, low, high) {
  if (high <= low) return item > a[low] ? low + 1 : low;

  mid = Math.floor((low + high) / 2);

  if (item == a[mid]) return mid + 1;

  if (item > a[mid]) return binarySearch(a, item, mid + 1, high);

  return binarySearch(a, item, low, mid - 1);
}

function sort(array) {
  for (let i = 1; i < array.length; i++) {
    let j = i - 1;
    let x = array[i];

    // Find location to insert
    // using binary search
    let loc = Math.abs(binarySearch(array, x, 0, j));

    // Shifting array to one
    // location right

    while (j >= loc) {
      array[j + 1] = array[j];
      j--;
    }

    // Placing element at its
    // correct location
    array[j + 1] = x;
  }
  return array;
}

let find;
function recursiveFunction(arr, x, start, end, y, searchType, array) {
  let list;
  list = arr;

  // Base Condition
  if (start > end) return false;

  // Find the middle index
  let mid = Math.floor((start + end) / 2);

  // Compare mid with given key x
  if (
    arr[mid] &&
    arr[mid][searchType] &&
    arr[mid][searchType][y] !== undefined &&
    arr[mid][searchType][y] === x
  ) {
    find = mid;
    array.push(arr[mid]);
    list.splice(mid, 1);
    return true;
  }

  // If element at mid is greater than x, search in the left half of mid
  if (
    arr[mid] &&
    arr[mid][searchType] &&
    arr[mid][searchType][y] !== undefined &&
    arr[mid][searchType][y] > x
  ) {
    return recursiveFunction(arr, x, start, mid - 1, y, searchType, array);
  }

  // If element at mid is smaller than x, search in the right half of mid
  return recursiveFunction(arr, x, mid + 1, end, y, searchType, array);
}

// console.log(filterArrayOne);

function getTime() {
  const currentTimeInMilliseconds = Date.now();
  timer.push(currentTimeInMilliseconds);
}
function inputCheck(input) {
  const validInputRegex = /^[a-zA-Z0-9]+$/;
  return validInputRegex.test(input);
}
function wordToArray(word) {
  let charArray = word.split("");
  return charArray;
}
