
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import form from './form.json'


const Questions = (props) => {
	const { questions, saveResponse, toggleResponseCheckbox } = props;

	const questionsList = questions.map(item => (
		<Question title={item.title} 
							answers={item.options}
							typeControl={item.type}  
							key={item.id} 
							id = {item.id}
							saveResponse = {saveResponse}
							toggleResponseCheckbox = { toggleResponseCheckbox }/>
	));

	return(
		<div className="app">
			{questionsList}
		</div>
	);
};

const Question = (props) => {
	const { title, answers, typeControl, id, saveResponse, toggleResponseCheckbox } = props;

	return(
		<div className="question_wrapper">
			<div className="question__title">
				{title}
			</div>

			{
				typeControl === "radioButtons" ? 
				<RadioButtons saveResponse = { saveResponse } 
											answers = { answers } 
											id = { id } /> : 
				<CheckBoxList toggleResponseCheckbox = { toggleResponseCheckbox } 
											answers={ answers } 
											id={ id }/>
			}

		</div>
	)
}

const RadioButtons = (props) => {
	const { answers, id, saveResponse } = props;

	const answersList = answers.value.map(item => {
		return 	<div  className="answer-button" 
									key={item.value} 
									onClick={() => saveResponse(id, +item.value)}>
							<input type="radio" id={id + item.value} name={id} value={item.value} /> 
							<label htmlFor={id + item.value}>{item.title}</label>
						</div>
	})

	return (
		<div className="question__answers-list">
			{answersList}
		</div>
	)
}

const CheckBoxList = (props) => {
	const { answers, id, toggleResponseCheckbox } = props;

	const answersList = answers.value.map(item => {
		return 	<div	className="answer-button" 
									key={item.value}>
							<input 	onClick={() => toggleResponseCheckbox( id, +item.value )} 
											type="checkbox" id={id + item.value} name={id} value={item.value} /> 
							<label 	htmlFor={id + item.value}>{item.title}</label>
						</div>
	})

	return (
		<div className="question__answers-list">
			{answersList}
		</div>
	)
}

const SendButton = (props) => {
	const { sendData } = props;

	return(
		<div	className="btn btn-send" 
					onClick={() => sendData(1, 2, "https://api.appercode.com/v1/", "volkswagen", "3f5e1949-3b66-473c-bda3-a317084ae753")}>
					Отправить
		</div>
	)
}

class App extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			idAndAnswers: null,
			questions: []
		};
		this.saveResponseRadio = this.saveResponseRadio.bind(this);
		this.toggleResponseCheckbox = this.toggleResponseCheckbox.bind(this);
		this.sendData = this.sendData.bind(this);
	}
	
	componentDidMount() {
		const partsFromJson = form.parts;
		let questionsForUser =[];
		let countQuestions = 0;
		let idAndAnswers = {}
		const selectedIdQuestions=[];
	
		while (countQuestions < 10){
			const randomValue = Math.floor(Math.random()*partsFromJson.length);
			if (selectedIdQuestions.indexOf(randomValue) === -1)
			{
				selectedIdQuestions.push(randomValue);
				countQuestions++;
			}
		}

		partsFromJson.forEach(item => {
			const idControl = item.sections[0].groups[0].controls[0].id;
			const typeControl = item.sections[0].groups[0].controls[0].type
			if (typeControl === "checkBoxList"){ 
				idAndAnswers[idControl] = [];
			} else {
				idAndAnswers[idControl] = null
			}
		});

		selectedIdQuestions.sort();
		
		selectedIdQuestions.map(item => (
			questionsForUser.push(partsFromJson[item].sections[0].groups[0].controls[0])
		));
		
		this.setState({
			questions: questionsForUser,
			idAndAnswers: idAndAnswers
		})
	}

	saveResponseRadio(idQuestion, valueAnswer){
		const { idAndAnswers } = this.state;
		idAndAnswers[idQuestion] = valueAnswer;

		this.setState({
			idAndAnswers: idAndAnswers
		})
	}
	
	toggleResponseCheckbox(idQuestion, valueAnswer){

		const { idAndAnswers } = this.state;
		const indexSearch = idAndAnswers[idQuestion].indexOf(valueAnswer)

		if( indexSearch === -1){
			idAndAnswers[idQuestion].push(valueAnswer);
		} 
		else {
			idAndAnswers[idQuestion].splice(indexSearch, 1);
		}

		this.setState({
			idAndAnswers: idAndAnswers
		})
		
	}

	sendData(userId, formId, baseUrl, project, session) {


		const idAndAnswers = this.state.idAndAnswers;

		const result = JSON.stringify(idAndAnswers);


		const body = '{"userId":"'+ userId+
				'","formId":"'+ formId+
				'","result":'+ result+
				',"status": "new"}';

		console.log(body);
		const xhr = new XMLHttpRequest();
		const url = baseUrl + project + "/objects/Answers";
		console.log(url);
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.setRequestHeader('X-Appercode-Session-Token', session);
		xhr.onreadystatechange = function () {
			if (xhr.readyState !== 4)
				return;
			if (xhr.status !== 200) {
				alert(xhr.status + ': ' + xhr.statusText);
			} 
		};
		xhr.send(body);
		
	}

  render() {
		const { questions } = this.state;
		const { saveResponseRadio, toggleResponseCheckbox, sendData } = this;
    return (<div className="app_wrapper">
							<Questions	questions = { questions} 
													saveResponse ={ saveResponseRadio }
													toggleResponseCheckbox = { toggleResponseCheckbox } />
							<SendButton sendData = { sendData } />
						</div>
    );
  }
}

function sessionFromNative(e) {
	alert(e);
  const userData = JSON.parse(e);
  const session = userData.sessionId;
  const userId = userData.userId;
  const project = userData.projectName;
  const baseUrl = userData.baseUrl;
	const refreshT = userData.refreshToken;

	
  /*ReactDOM.render(<App 	session = {session}
												userId = {userId}
												project = {project}
												baseUrl = {baseUrl}
												refreshT = {refreshT}/>, 
									document.getElementById('root'));*/
}
ReactDOM.render(<App />, document.getElementById('root'));
sessionFromNative('{"sessionId":"3f5e1949-3b66-473c-bda3-a317084ae753","userId":"1","project": "volkswagen","baseUrl":"https://api.appercode.com/v1/","refreshT":"1"}')
/*
'{"sessionId":"29ba0dce-a7c0-442a-84f1-49daea0647e0","userId":"1","project": "volkswagen","baseUrl":"https://api.appercode.com/v1/","refreshT":"1"}'
*/
