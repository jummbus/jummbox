/*
Copyright (C) 2012 John Nesky

Permission is hereby granted, free of charge, to any person obtaining a copy of 
this software and associated documentation files (the "Software"), to deal in 
the Software without restriction, including without limitation the rights to 
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies 
of the Software, and to permit persons to whom the Software is furnished to do 
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.
*/

/// <reference path="synth.ts" />
/// <reference path="editor.ts" />
/// <reference path="SongEditor.ts" />

"use strict";

module beepbox {
	const {button, div, span, input, br, text} = html;
	
	export class SongDurationPrompt {
		private readonly _beatsStepper: HTMLInputElement = input({style: "width: 40px; height: 16px;", type: "number", min: "1", max: "128", step: "1"});
		private readonly _barsStepper: HTMLInputElement = input({style: "width: 40px; height: 16px;", type: "number", min: "1", max: "128", step: "1"});
		private readonly _patternsStepper: HTMLInputElement = input({style: "width: 40px; height: 16px;", type: "number", min: "1", max: "32", step: "1"});
		private readonly _instrumentsStepper: HTMLInputElement = input({style: "width: 40px; height: 16px;", type: "number", min: "1", max: "10", step: "1"});
		private readonly _okayButton: HTMLButtonElement = button({style: "width:125px;", type: "button"}, [text("Okay")]);
		private readonly _cancelButton: HTMLButtonElement = button({style: "width:125px;", type: "button"}, [text("Cancel")]);
		
		public readonly container: HTMLDivElement = div({style: "position: absolute; width: 100%; height: 100%; left: 0; display: flex; justify-content: center; align-items: center;"}, [
			div({style: "text-align: center; background: #000000; width: 274px; border-radius: 15px; border: 4px solid #444444; color: #ffffff; font-size: 12px; padding: 20px;"}, [
				div({style: "font-size: 30px"}, [text("Custom Song Size")]),
				div({style: "height: 30px;"}),
				div({style: "display: flex; flex-direction: row; height: 46px; align-items: center; width: 100%; justify-content: flex-end;"}, [
					div({style: "text-align: right; line-height: 18px;"}, [
						text("Beats per bar:"),
						br(),
						span({style: "color: #888888;"}, [text("(Multiples of 3 or 4 are recommended)")]),
					]),
					div({style: "display: inline-block; width: 20px; height: 1px;"}),
					this._beatsStepper,
				]),
				div({style: "display: flex; flex-direction: row; height: 46px; align-items: center; width: 100%; justify-content: flex-end;"}, [
					div({style: "display: inline-block; text-align: right; line-height: 18px;"}, [
						text("Bars per song:"),
						br(),
						span({style: "color: #888888;"}, [text("(Multiples of 2 or 4 are recommended)")]),
					]),
					div({style: "display: inline-block; width: 20px; height: 1px;"}),
					this._barsStepper,
				]),
				div({style: "display: flex; flex-direction: row; height: 46px; align-items: center; width: 100%; justify-content: flex-end;"}, [
					text("Patterns per channel:"),
					div({style: "display: inline-block; width: 20px; height: 1px;"}),
					this._patternsStepper,
				]),
				div({style: "display: flex; flex-direction: row; height: 46px; align-items: center; width: 100%; justify-content: flex-end;"}, [
					text("Instruments per channel:"),
					div({style: "display: inline-block; width: 20px; height: 1px;"}),
					this._instrumentsStepper,
				]),
				div({style: "height: 30px;"}),
				div({style: "display: flex; flex-direction: row; justify-content: space-between;"}, [
					this._okayButton,
					this._cancelButton,
				]),
			]),
		]);
		
		constructor(private _doc: SongDocument, private _songEditor: SongEditor) {
			this._beatsStepper.value = this._doc.song.beats + "";
			this._beatsStepper.min = Music.beatsMin + "";
			this._beatsStepper.max = Music.beatsMax + "";
			
			this._barsStepper.value = this._doc.song.bars + "";
			this._barsStepper.min = Music.barsMin + "";
			this._barsStepper.max = Music.barsMax + "";
			
			this._patternsStepper.value = this._doc.song.patterns + "";
			this._patternsStepper.min = Music.patternsMin + "";
			this._patternsStepper.max = Music.patternsMax + "";
			
			this._instrumentsStepper.value = this._doc.song.instruments + "";
			this._instrumentsStepper.min = Music.instrumentsMin + "";
			this._instrumentsStepper.max = Music.instrumentsMax + "";
			
			this._okayButton.addEventListener("click", this._saveChanges);
			this._cancelButton.addEventListener("click", this._onClose);
			this._beatsStepper.addEventListener("keypress", SongDurationPrompt._validateKey);
			this._barsStepper.addEventListener("keypress", SongDurationPrompt._validateKey);
			this._patternsStepper.addEventListener("keypress", SongDurationPrompt._validateKey);
			this._instrumentsStepper.addEventListener("keypress", SongDurationPrompt._validateKey);
			this._beatsStepper.addEventListener("blur", SongDurationPrompt._validateNumber);
			this._barsStepper.addEventListener("blur", SongDurationPrompt._validateNumber);
			this._patternsStepper.addEventListener("blur", SongDurationPrompt._validateNumber);
			this._instrumentsStepper.addEventListener("blur", SongDurationPrompt._validateNumber);
		}
		
		private _onClose = (): void => { 
			this._songEditor.closePrompt(this);
			this._okayButton.removeEventListener("click", this._saveChanges);
			this._cancelButton.removeEventListener("click", this._onClose);
			this._beatsStepper.removeEventListener("keypress", SongDurationPrompt._validateKey);
			this._barsStepper.removeEventListener("keypress", SongDurationPrompt._validateKey);
			this._patternsStepper.removeEventListener("keypress", SongDurationPrompt._validateKey);
			this._instrumentsStepper.removeEventListener("keypress", SongDurationPrompt._validateKey);
			this._beatsStepper.removeEventListener("blur", SongDurationPrompt._validateNumber);
			this._barsStepper.removeEventListener("blur", SongDurationPrompt._validateNumber);
			this._patternsStepper.removeEventListener("blur", SongDurationPrompt._validateNumber);
			this._instrumentsStepper.removeEventListener("blur", SongDurationPrompt._validateNumber);
		}
		
		private static _validateKey(event: KeyboardEvent): boolean {
			const charCode = (event.which) ? event.which : event.keyCode;
			if (charCode != 46 && charCode > 31 && (charCode < 48 || charCode > 57)) {
				event.preventDefault();
				return true;
			}
			return false;
		}
		
		private static _validateNumber(event: Event): void {
			const input: HTMLInputElement = <HTMLInputElement>event.target;
			input.value = Math.floor(Math.max(Number(input.min), Math.min(Number(input.max), Number(input.value)))) + "";
		}
		
		private static _validate(input: HTMLInputElement): number {
			return Math.floor(Number(input.value));
		}
		
		private _saveChanges = (): void => {
			const sequence: ChangeSequence = new ChangeSequence();
			sequence.append(new ChangeBeats(this._doc, SongDurationPrompt._validate(this._beatsStepper)));
			sequence.append(new ChangeBars(this._doc, SongDurationPrompt._validate(this._barsStepper)));
			sequence.append(new ChangePatterns(this._doc, SongDurationPrompt._validate(this._patternsStepper)));
			sequence.append(new ChangeInstruments(this._doc, SongDurationPrompt._validate(this._instrumentsStepper)));
			this._doc.history.record(sequence);
			this._onClose();
		}
	}
}
