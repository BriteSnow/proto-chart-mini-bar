import { adoptStyleSheets, append, BaseHTMLElement, css, customElement, html } from 'dom-native';
import { ChartBox } from './chart-box';
import { ChartMini } from './chart-mini';
import { getChartData } from './dcos';

const _shadowCss = css`

	:host{
		display: grid;

		grid-template-columns: 1fr .5rem;
		grid-gap: 1rem;
	}

`;

@customElement('v-chart')
class ChartView extends BaseHTMLElement {
	#boxEl: ChartBox;
	#miniEl: ChartMini;

	constructor() {
		super();

		[this.#boxEl, this.#miniEl] = append(this.attachShadow({ mode: 'open' }), html`
			<chart-box></chart-box>
			<chart-mini></chart-mini>
		`) as [ChartBox, ChartMini]

		adoptStyleSheets(this, _shadowCss);
	}

	async postDisplay() {
		const data = await getChartData();

		this.#boxEl.data = data;
		const [boxCols, boxRows] = this.#boxEl.getColsAndRows();
		this.#miniEl.data = {
			chartData: data,
			boxCols,
			boxRows
		};
	}


}