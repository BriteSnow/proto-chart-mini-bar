
const IT = 100000;

let data: ChartData;

export type ChartData = number[];

genData();




export async function getChartData() {
	return data;
}


//#region    ---------- Data Generator ---------- 
function genData() {
	data = [];
	let prev = 1;
	for (let i = 0; i < IT; i++) {
		const prob = prev ? 500 : 100;
		let val = getRandomInt(prob) == 0 ? (prev ? 0 : 1) : prev;
		data.push(val);
		prev = val;

	}
}
function getRandomInt(max: number) {
	return Math.floor(Math.random() * Math.floor(max));
}

//#endregion ---------- /Data Generator ---------- 

