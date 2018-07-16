
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import logo from './vw.png';

const Welcome = (props) => {
	const {beginTest} = props;
	return  <div className="welcome-page">
						<img src={logo} alt=""/>
						<h2>Ответьте на 10 вопросов о Volkswagen Touareg</h2>
						<BeginTest beginTest={beginTest} />
					</div>
}

const BeginTest = (props) => {
	const {beginTest} = props;
	return <div	className="btn btn-begin" onClick={() => beginTest()}>
						Начать тест
					</div>
}

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
	const { sendData, userId, formId, baseUrl, projectName, session } = props;

	return(
		<div	className="btn btn-send" 
					onClick={() => sendData(userId, formId, baseUrl, projectName, session)}>
					Отправить
		</div>
	)
}

const ScreenGratitude = () => {
	return <div className="gratitude-page">
						<img src={logo} alt=""/>
						<h2>Ваши ответы сохранены, спасибо</h2>
				</div>
}


class App extends React.Component {

	constructor(props){
		super(props);
		this.state = {
			session: null,
			userId: null,
			idAndAnswers: null,
			questions: [],
			displayBlocks:
				{
					welcome: false,
					questions: false,
					gratitude: false
				}
		};
		this.saveResponseRadio = this.saveResponseRadio.bind(this);
		this.toggleResponseCheckbox = this.toggleResponseCheckbox.bind(this);
		this.sendData = this.sendData.bind(this);
		this.beginTest = this.beginTest.bind(this);
	}

	beginTest(){
		const {displayBlocks} = this.state;
		displayBlocks.welcome = false;
		displayBlocks.questions = true;
		this.setState({
			displayBlocks : displayBlocks
		})
	}
	
	
	componentDidMount() {
		
		function login(baseUrl, projectName, formId, app){

			var xhr = new XMLHttpRequest();
			xhr.open('POST', baseUrl + projectName + "/login/anonymous/", true);
			xhr.setRequestHeader("Content-Type", "application/json");

			xhr.onreadystatechange = function () {
				if (xhr.readyState != 4)
					return;
				if (xhr.status != 200) {
					alert(xhr.status + ': ' + xhr.statusText);
				} else {
					var response = JSON.parse(xhr.responseText);
					console.log(response);
					userId = response.userId;
					session = response.sessionId;
					console.log(userId);
					console.log(session);
					app.setState({
						session: session,
						userId: userId
					})
					getForm(userId, formId, baseUrl, projectName, session, app);
				}
			};
			xhr.send(baseUrl + projectName + "/login/anonymous/");

			

		}

		function getForm (userId, formId, baseUrl, projectName, session, app) {
			var xhr = new XMLHttpRequest();
			xhr.open('GET', baseUrl + projectName + "/forms/" + formId);
			xhr.setRequestHeader('X-Appercode-Session-Token', session);
			xhr.send();
	
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4)
					return;
				if (xhr.status === 401) {
					//loginByToken();
				} else
				if (xhr.status !== 200) {
					alert(xhr.status + ': ' + xhr.statusText);
				} else {
					var response = JSON.parse(xhr.responseText);
					partsFromJson = response.parts;
					
					createQuestionsForUser(app);
				}
			}
		}

		/*function checkExecution(userId, formId){
			var xhr = new XMLHttpRequest();
			xhr.open('GET', baseUrl + projectName + "/objects/Answers?include=%5B'userId'%2C'formId'%5D&take=-1");
			xhr.setRequestHeader('X-Appercode-Session-Token', session);
			xhr.send();
	
			xhr.onreadystatechange = function () {
				if (xhr.readyState !== 4)
					return;
				if (xhr.status === 401) {
					//loginByToken();
				} else
				if (xhr.status !== 200) {
					alert(xhr.status + ': ' + xhr.statusText);
				} else {
					var response = JSON.parse(xhr.responseText);
					
					if(response.some(item => (
						(item.userId == userId && item.formId == formId)
					))){
						const displayBlocks = app.state.displayBlocks
						displayBlocks.gratitude = true;
						app.setState({
							displayBlocks: displayBlocks
						})
					} else {
						
					}
					
				}
			}
		}*/

		function createQuestionsForUser(app){

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
			
			const displayBlocks = app.state.displayBlocks
			displayBlocks.welcome = true
			app.setState({
				questions: questionsForUser,
				idAndAnswers: idAndAnswers,
				displayBlocks: displayBlocks
			})
		}

		let {userId, formId, baseUrl, projectName, session} = this.props;
		let partsFromJson;
		let questionsForUser =[];
		let countQuestions = 0;
		let idAndAnswers = {}
		const selectedIdQuestions=[];
		const app = this;
		login(baseUrl, projectName, formId, app);
		

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
		console.log({userId, formId, baseUrl, project, session});
		const idAndAnswers = this.state.idAndAnswers;
		const result = JSON.stringify(idAndAnswers);
		const body = '{"userId":"'+ userId+
				'","formId":"'+ formId+
				'","result":'+ result+
				',"status": "new"}';

		const xhr = new XMLHttpRequest();
		const url = baseUrl + project + "/objects/Answers";
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
		
		const {displayBlocks} = this.state;
		displayBlocks.questions = false;
		displayBlocks.gratitude = true;
		this.setState({
			displayBlocks: displayBlocks
		})
	}

  render() {
		const { questions, displayBlocks, session, userId } = this.state;
		const { saveResponseRadio, toggleResponseCheckbox, sendData, beginTest } = this;
		const { baseUrl, projectName, formId} = this.props;
    return (<div className="app_wrapper">
							{displayBlocks.welcome ? <Welcome beginTest ={beginTest}/> : null}

							{displayBlocks.questions ? 
							<Questions	questions = { questions} 
													saveResponse ={ saveResponseRadio }
													toggleResponseCheckbox = { toggleResponseCheckbox } />
							: null}

							{displayBlocks.questions ? 
							<SendButton sendData = { sendData }
													session={session} 
													userId={userId}
													baseUrl={baseUrl}
													projectName={projectName} 
													formId = {formId}
							/> : null}
							
							{displayBlocks.gratitude ?
							<ScreenGratitude/> :
							null
							}
						</div>
    );
  }
}

/*function sessionFromNative(e) {
  const userData = JSON.parse(e);
  const session = userData.sessionId;
  const userId = userData.userId;
  const projectName = userData.projectName;
  const baseUrl = userData.baseUrl;

	
	
}*/

ReactDOM.render(<App 
	/*session={session} 
	userId={userId}*/
	baseUrl={"https://api.appercode.com/v1/"}
	projectName={"volkswagen"}
	formId={2}
/>, document.getElementById('root'));


//sessionFromNative('{"sessionId":"6794fef7-4b92-4c7a-91a2-3417cf383097","userId":"1","refreshT":"1"}')

