import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../app-modules/core/services';
import { ConfirmationService } from '../app-modules/core/services/confirmation.service';

@Component({
	selector: 'ResetComponent',
	templateUrl: './reset-password.component.html',
	styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {

	constructor(
		private router: Router,
		private authService: AuthService,
		private confirmationService: ConfirmationService) { };

	public response: any;
	public error: any;
	showQuestions: boolean = false;
	hideOnGettingQuestions: boolean = true;
	securityQuestions: any;
	answer: any = undefined;

	dynamictype: any = 'password';

	public questionId: any[] = [];
	public questions: any[] = [];
	//public correctAnswers: any[] = [];
	public userAnswers: any[] = [];
	userFinalAnswers: any[] = [];

	wrong_answer_msg: any = "";

	getQuestions(username: any) {
		localStorage.setItem('userName', username);
		this.authService.getUserSecurityQuestionsAnswer(username).subscribe(
			(response: any) =>{
				if (response !== undefined && response !== null)
				this.handleSuccess(response.data)
				},
			(error: any) => this.error = <any>error
		);
	}

	handleSuccess(data: any) {
		console.log(data);
		if (data !== undefined && data !==null && data.forgetPassword != "user Not Found") { 
			if (data.SecurityQuesAns.length > 0) {
				this.securityQuestions = data.SecurityQuesAns;
				this.showQuestions = true;
				this.hideOnGettingQuestions = false;

				this.splitQuestionAndQuestionID();
			}
			else {
				// this.router.navigate(["/"]);
				this.logout()
				this.confirmationService.alert("Questions are not set for this user", 'error');
			}
		}
		else {
			// this.router.navigate(["/"]);
			this.logout()
			this.confirmationService.alert("User not found", 'error');
		}
	}

	showPWD() {
		this.dynamictype = 'text';
	}

	hidePWD() {
		this.dynamictype = 'password';
	}

	splitQuestionAndQuestionID() {
		console.log('Q n A', this.securityQuestions);
		for (var i = 0; i < this.securityQuestions.length; i++) {
			this.questions.push(this.securityQuestions[i].question);
			this.questionId.push(this.securityQuestions[i].questionId);
		}
		console.log('questions', this.questions);
		console.log('questionID', this.questionId);
		this.showMyQuestion();
	}

	bufferQuestionId: any;
	bufferQuestion: any;
	counter: number = 0;

	showMyQuestion() {
		console.log('this is question' + (this.counter + 1));
		this.bufferQuestion = this.questions[this.counter];
		this.bufferQuestionId = this.questionId[this.counter];
	}

	nextQuestion() {
		if (this.counter < 3) {
			let reqObj = {
				"questionId": this.questionId[this.counter],
				"answer": this.answer,
			}
			this.userFinalAnswers.push(reqObj);
			this.wrong_answer_msg = "";
			this.counter = this.counter + 1;
			if (this.counter < 3) {
				this.showMyQuestion();
				this.answer = undefined;
			}
			else {
				this.checking();
			}
		}
		console.log('user Final Answers are:', this.userFinalAnswers);	
	}

	checking() {
		this.authService.validateSecurityQuestionAndAnswer(this.userFinalAnswers, localStorage.getItem('userName')).
			subscribe((response) => {
				if (response !== undefined && response !== null){
				if (response.statusCode == 200) {
					this.counter = 0;
					this.router.navigate(['/set-password']);
					this.authService.transactionId = response.data.transactionId;
				}
				else {
					this.showQuestions = true;
					this.counter = 0;
					this.confirmationService.alert(response.errorMessage, 'error');
					this.getQuestions(localStorage.getItem('userName'));
					this.router.navigate(['/reset-password']);
					this.splitQuestionAndQuestionID();

				}
			}
			},
				(error) => {
					this.showQuestions = true;
					this.counter = 0;
					this.confirmationService.alert(error.errorMessage, 'error');
					this.router.navigate(['/reset-password']);
					this.splitQuestionAndQuestionID();
				}
			);

		this.answer = undefined;
		this.userFinalAnswers = [];
	}

	logout() {
		this.authService.logout().subscribe((res) => {
			this.router.navigate(['/login']).then(result => {
				if (result) {
					localStorage.clear();
					sessionStorage.clear();
				}
			});
		});
	}
}
