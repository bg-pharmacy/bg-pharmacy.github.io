const iam = document.querySelector("#loser");
const medicationForm = document.forms["medication_search_form"]
const content = document.querySelector("#content");
if (!(iam && medicationForm && content)) {
	throw new Error("Container not found");
}

const initialSearch = (new URL(document.URL)).searchParams.get("search");
if (initialSearch) {
	iam.value = initialSearch;
}

const get_pharmacy_tds = ({ label, slug, price, pharmacy, price_discount }) => {
	const attr = 'target="_blank" href=';
	const empty = '<td>&nbsp;</td>';
	const cell = {
		link: `<td>${label}</td>`,
		icon: empty,
		price: empty,
		discount: empty,
	};
	if (typeof price === 'number') {
		cell.price = `<td class="price-cell">${price.toFixed(2)}</td>`;
	}
	if (typeof price_discount === 'number') {
		cell.discount = `<td class="price-cell">${price_discount.toFixed(2)}</td>`;
	}
	switch (pharmacy) {
		case "remedium":
			return { ...cell,
					 link: `<td><a ${attr}"${get_remedium_link(slug)}">${label}</a></td>`,
					 icon: `<td>${remedium_icon}</td>`,
				   };
		case "sopharmacy":
			return { ...cell,
			         link: `<td><a ${attr}"${get_sopharmancy_link(slug)}">${label}</a></td>`,
					 icon: `<td>${sopharmacy_icon}</td>`,
				   };
		case "propharma":
			return { ...cell,
			         link: `<td><a ${attr}"${get_propharma_link(slug)}">${label}</a></td>`,
					 icon: `<td>${propharma_icon}</td>`,
				   };
		default:
			console.error(`Unknown pharmacy ${pharmacy}.`);
			return cell;
	}
};

const get_remedium_link = slug => `https://remedium.bg/${slug}/p`;
const get_sopharmancy_link = slug => `https://sopharmacy.bg/bg/${slug}`;
const get_propharma_link = slug => slug;

const remedium_icon = '<image src="/static/images/remedium.png">'
const sopharmacy_icon = '<image src="/static/images/sopharmacy.png">'
const propharma_icon = '<image src="/static/images/propharma.png">'

const table_head = `
<thead>
	<tr>
		<th></th>
		<th>Име</th>
		<th>&#x271A;</th>
		<th>Цена</th>
		<th>Отстъпка</th>
	</tr>
</thead>
`;

medicationForm.addEventListener("submit", e => {
	e.preventDefault();
	e.stopPropagation();

	const currentSearch = iam.value;
	if (currentSearch) {
		const response = fetch(`http://94.26.19.117:15341/pharmaceutical/${currentSearch}`, {
			method: "GET",
		});
		response.then(r => {
			console.log(r.status);
			return r.json();
		}).then(payload => {
			console.log({payload});
			const { medications } = payload;
			if (medications.length > 0) {
				const row = (m, i) => {
					const { link, icon, price, discount } = get_pharmacy_tds(m);
					return `<tr><td>${i+1}</td>${link}${icon}${price}${discount}</tr>`;
				};
				const trs = medications.map(row).join('');
				content.innerHTML = `<table>${table_head}<tbody>${trs}</tbody></table>`;
			}
		}).catch(error => {
			console.error(`Something went wrong while fetching data about the pharmaceutical ${currentSearch}`);
			console.error({error});
		});
	}
});
