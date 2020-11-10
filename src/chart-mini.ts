import { adoptStyleSheets, append, BaseHTMLElement, css, customElement } from 'dom-native';
import { ChartData } from './dcos';
const GREEN = 'rgb(0, 200, 0)';
const RED = 'rgb(200, 0, 0)';

const _shadowCss = css`
	:host {
		overflow: auto;
	}
	canvas{
	}
`;

type ChartMiniData = {
	chartData: ChartData,
	boxCols: number,
	boxRows: number
};

/**
 * TODO: 
 * 	- still need to make the right display without scroll, to summarize and make it clickable.
 * 
 */
@customElement('chart-mini')
export class ChartMini extends BaseHTMLElement {
	#data?: ChartMiniData;
	#canvasEl: HTMLCanvasElement;

	set data(val: ChartMiniData) {
		this.#data = val;
		this.refresh();
	}

	constructor() {
		super();

		[this.#canvasEl] = append(this.attachShadow({ mode: 'open' }), '<canvas></canvas>') as [HTMLCanvasElement];

		adoptStyleSheets(this, _shadowCss);
	}

	async refresh() {
		const { chartData: data, boxCols, boxRows } = this.#data!;
		const rect = this.getBoundingClientRect();

		let lineHeight = rect.height / boxRows;

		// this is the dot drawing
		const dot_w = rect.width;
		const dot_h = Math.floor(lineHeight * 1000) / 1000;


		const ctx = this.#canvasEl.getContext('2d')!;
		this.#canvasEl.width = this.clientWidth;
		this.#canvasEl.height = boxRows * dot_h;

		const start = performance.now();

		let lineIdx = -1;
		let lineVal = 1;

		for (let i = 0, l = data.length; i < l; i++) {
			const val = data[i];
			const mod = (i % boxCols);

			lineVal = lineVal & val;

			if (i >= boxCols && mod == 0) {
				lineIdx++;

				const x = 0;
				const y = lineIdx * dot_h;

				ctx.fillStyle = val ? GREEN : RED;
				ctx.fillRect(x, y, dot_w, dot_h);
				lineVal = 1;
			}
		}
		console.log(`->> mini refresh time ${(performance.now() - start).toPrecision(3)}ms`,);

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				console.log(`->> mini next frame ${(performance.now() - start).toPrecision(3)}ms`,);
			})
		})
	}

}