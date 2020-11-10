import { adoptStyleSheets, append, BaseHTMLElement, css, customElement, onEvent, style } from 'dom-native';
import { ChartData } from './dcos';

const DOT_W = 8;
const DOT_H = 16;
const DOT_G = 2; // gap
const GREEN = 'rgb(0, 184, 0)';
const RED = 'rgb(200, 0, 0)';


const _shadowCss = css`
	:host{
		position: relative;
		display: grid;
		grid-gap: ${DOT_G}px;
		grid-template-columns: repeat(auto-fit, ${DOT_W}px);
		grid-auto-rows: ${DOT_H}px;
		overflow: scroll;
		background: #fff;
	}
	canvas{
		position: relative;
	}

	div.dot-sel{
		visibility: hidden;
		position: absolute;
		width: ${DOT_W}px;
		height: ${DOT_H}px;
		transform: scale(2);
		border: solid 1px #ddd;
		box-shadow: var(--elev-1);
	}
`;


/**
 * The main chart box with mouse over. 
 * 
 * - One canvas to draw all of the data dots. This way, avoid to have thouthands of html elements
 * - Hover on the container, and compute the row/col position
 * - When over, reuse the .dot-sel to show the overlay
 * 
 * TODO: 
 * - handle resize of window and resaize of the panels
 * - handle with the mouse exit the container (should deselect and make the dot-sel hidden)
 * - When mouse over the right side, it looks like it shows an item from an invisible column, 
 *   but in fact, it is the first item of the next row. 
 * 	 Needs to show the last one of the row to be intuitive.
 */
@customElement('chart-box')
export class ChartBox extends BaseHTMLElement {
	#data?: ChartData;
	#canvasEl: HTMLCanvasElement;
	#selDotEl: HTMLElement;
	#selIdx?: number



	set data(val: ChartData) {
		this.#data = val;
		this.refresh();
	}

	@onEvent('pointermove')
	onCursortMove(evt: PointerEvent) {
		const data = this.#data!;

		// get the number of columns and rows for the data and el
		const [numCols, numRows] = this.getColsAndRows();

		// find the x/y relative to the 
		const el = this;
		const rect = el.getBoundingClientRect();
		const scrollTop = el.scrollTop;
		const x = evt.clientX - rect.left;
		const y = evt.clientY - rect.top + scrollTop;

		// get the index at the x / y. 
		const col = Math.floor(x / (DOT_W + DOT_G));
		const row = Math.floor(y / (DOT_H + DOT_G));
		const valIdx = row * numCols + col;

		// if the select index changed, we move the dotSel element
		if (this.#selIdx != valIdx) {
			const val = data[valIdx];
			style(this.#selDotEl, {
				visibility: 'visible', // make sure it is visible
				background: val ? GREEN : RED,
				top: `${row * (DOT_H + DOT_G)}px`,
				left: `${col * (DOT_W + DOT_G)}px`
			});

			this.#selIdx = valIdx;
		}


	}


	constructor() {
		super();

		[this.#canvasEl, this.#selDotEl] = append(this.attachShadow({ mode: 'open' }), `
			<canvas></canvas>
			<div class="dot-sel"></div>
		`) as [HTMLCanvasElement, HTMLElement];

		adoptStyleSheets(this, _shadowCss);
	}


	async refresh() {
		const data = this.#data!;

		const ctx = this.#canvasEl.getContext('2d')!;
		this.#canvasEl.width = this.clientWidth;

		const [numCols, numRows] = this.getColsAndRows();

		this.#canvasEl.height = numRows * (DOT_H + DOT_G);

		const start = performance.now();
		const colMax = Math.floor(this.clientWidth / (DOT_W + DOT_G));

		for (let i = 0, l = data.length; i < l; i++) {
			const val = data[i];

			const x = (i % colMax) * (DOT_W + DOT_G);
			const y = Math.floor(i / colMax) * (DOT_H + DOT_G);

			ctx.fillStyle = val ? GREEN : RED;
			ctx.fillRect(x, y, DOT_W, DOT_H);
		}

		console.log(`->> box refresh time ${(performance.now() - start).toPrecision(3)}ms`,);

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				console.log(`->> box next frame ${(performance.now() - start).toPrecision(3)}ms`,);
			});
		})
	}


	getColsAndRows(): [cols: number, rows: number] {
		const rect = this.getBoundingClientRect();
		const numCols = Math.floor(rect.width / (DOT_W + DOT_G));
		const numRows = Math.ceil(this.#data!.length / numCols);

		return [numCols, numRows];
	}

}

