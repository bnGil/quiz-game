const question = document.getElementById("question");
const choices = Array.from(document.getElementsByClassName("choice-text")); //convert node list to array
const scoreText = document.getElementById("score");
const loader = document.getElementById("loader");
const game = document.getElementById("game");

let currentQuestion = {};
let acceptingAnswers = false; //to make a delay after user answers a question
let score = 0;
let availableQuestions = []; //storing the available questions so they won't repeat themselves
let questions = [];

fetch("https://opentdb.com/api.php?amount=100")
  .then((res) => {
    return res.json();
  })
  .then((loadedQuestions) => {
    console.log(loadedQuestions);
    questions = loadedQuestions.results.map((loadedQuestion) => {
      const formattedQuestion = {
        question: loadedQuestion.question,
      };
      const answerChoices = [...loadedQuestion.incorrect_answers];
      formattedQuestion.answer = Math.floor(Math.random() * 3) + 1;
      answerChoices.splice(
        formattedQuestion.answer - 1,
        0,
        loadedQuestion.correct_answer
      );

      answerChoices.forEach((choice, index) => {
        formattedQuestion["choice" + (index + 1)] = choice;
      });
      return formattedQuestion;
    });
    game.classList.remove("hidden");
    loader.classList.add("hidden");
    startGame();
  })
  .catch((err) => {
    console.log(err);
  });

const CORRECT_BONUS = 1; //1 point for a correct answer

startGame = () => {
  score = 0;
  availableQuestions = [...questions]; //copy of all the questions

  let twoMinutes = 60 * 2;
  let timerDisplay = document.getElementById("timer");
  startTimer(twoMinutes, timerDisplay);

  getNewQuestion();
};

getNewQuestion = () => {
  if (availableQuestions.length === 0) {
    //if ran out of questions, go to the end page
    localStorage.setItem("mostRecentScore", score);
    return window.location.assign("/end.html");
  }
  const questionIndex = Math.floor(Math.random() * availableQuestions.length);
  currentQuestion = availableQuestions[questionIndex];
  question.innerText = he.decode(currentQuestion.question);

  choices.forEach((choice) => {
    const number = choice.dataset["number"];
    if (currentQuestion["choice" + number]) {
      choice.innerText = he.decode(currentQuestion["choice" + number]);
      choice.parentElement.style.display = "flex";
    } else {
      choice.parentElement.style.display = "none";
    }
  });

  availableQuestions.splice(questionIndex, 1);

  acceptingAnswers = true;
};

// getting user's answer
choices.forEach((choice) => {
  choice.addEventListener("click", (e) => {
    if (!acceptingAnswers) return;

    acceptingAnswers = false;
    const selectedChoice = e.target;
    const selectedAnswer = selectedChoice.dataset["number"];

    let classToApply = "incorrect";
    if (Number(selectedAnswer) === currentQuestion.answer) {
      classToApply = "correct";
    }

    selectedChoice.parentElement.classList.add(classToApply);
    //delay for getting a new question so the answer's feedback can be seen
    setTimeout(() => {
      selectedChoice.parentElement.classList.remove(classToApply);
      if (classToApply === "correct") {
        incrementScore(CORRECT_BONUS);
      }
      getNewQuestion();
    }, 1000);
  });
});

incrementScore = (num) => {
  score += num;
  scoreText.innerText = score;
};

startTimer = (duration, timerDisplay) => {
  let timer = duration,
    minutes,
    seconds;
  setInterval(() => {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    timerDisplay.innerHTML = minutes + ":" + seconds;

    if (--timer < 0) {
      timer = duration;
      localStorage.setItem("mostRecentScore", score);
      return window.location.assign("/end.html");
    }
  }, 1000);
};
