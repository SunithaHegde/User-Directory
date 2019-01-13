class userDirectoryApp {
		constructor(){
			this.searchComponent = null;
			this.userList = null;
			this.totalCount = 600;
			this.getUserList().then((value) => {
				this.userList = value["People"];
				this.createUserComponent(this.userList);
				let searchComponent = document.createElement('search-component');
				searchComponent.setUserList(value["People"]);
				this.searchComponent = searchComponent;
				this.searchComponent.addEventListener("keyup",{
					handleEvent:this.searchHandler,
					taskScope:this
				});
				document.getElementById("searchBar").appendChild(this.searchComponent);
				document.getElementById("contactList").addEventListener('scroll', {handleEvent:this.onScrollHandler,taskScope:this});
			});	
		}
		getUserList() {
			return new Promise((resolve,reject) => {
					const HTTP = new XMLHttpRequest();
					HTTP.responseType = 'json';
					HTTP.open("GET","https://api.myjson.com/bins/tff5s");
					HTTP.send();
					HTTP.onreadystatechange = (e) => {
						if (HTTP.readyState == 4 && HTTP.status == 200) {
							resolve(HTTP.response);
						}	
					}
			}); 
		}	
		createUserComponent(list){
			let documentFragment = document.createDocumentFragment();
			list.forEach((val) => {
				let taskComponent = document.createElement('contact-item');
				taskComponent.setAttribute("data-name",val.name);
				taskComponent.setContactDetails(val);
				documentFragment.appendChild(taskComponent);
			});
			document.getElementById("contactList").appendChild(documentFragment);
		}	
		searchHandler(e){
			if(e.key ==undefined ||e.key.toLowerCase() === "enter"){
				let inputVal = this.taskScope.searchComponent.getAttribute("data-value");
				let documentFragment = document.createDocumentFragment();
				const filteredList = this.taskScope.userList.filter(function(item){
					return item.name.toLowerCase().includes(inputVal.toLowerCase());
				});
				filteredList.forEach((val) => {
					let taskComponent = document.createElement('contact-item');
					taskComponent.setAttribute("data-name",val.name);
					taskComponent.setContactDetails(val);
					documentFragment.appendChild(taskComponent);
				});
				document.getElementById("contactList").innerHTML = "";
				document.getElementById("contactList").appendChild(documentFragment);
			}
		}	
		onScrollHandler(e){
			if(document.getElementById("contactList").scrollTop + document.getElementById("contactList").clientHeight >= document.getElementById("contactList").scrollHeight){
				this.taskScope.userList.length < this.taskScope.totalCount && this.taskScope.getUserList().then((value) => {
					this.taskScope.userList = this.taskScope.userList.concat(value["People"]);
					this.taskScope.createUserComponent(value["People"]);
				});	
			}
		}	
}	

let clickedElement; 
customElements.define('contact-item',
  class extends HTMLElement {
    constructor() {
      super();
	  this.userDetails = "";
		let contact = `<style>
				.contactName {
					padding: 16px;
					border-bottom: solid 2px #f3f3f3;
					transition: all 0.6s ease;
					height:30px;
				}

				.contactName:hover {
					background: #c3ccdd;
					border-radius: 20px;
				}
				.right{
					border: solid black;
					border-width: 0 3px 3px 0;
					display: inline-block;
					padding: 3px;
					display:none;
					transform: rotate(-45deg);
					-webkit-transform: rotate(-45deg);
				}	
				.active {
						background: #e0e4ea;
				}	
				</style>
				<div class="contactName"><i class="right"></i></div>
				`
		let shadow = this.attachShadow({mode: 'open'});
		shadow.innerHTML = contact;
		this.contactComponent = this.shadowRoot.querySelector('.contactName');
		this.addEventListener("click",{ 
			handleEvent:this.contactHandler,
			taskScope:this
		},false);
		
	}
	setContactDetails(val){
		this.contactComponent.textContent=val.name;
		this.userDetails = val;
	}	
	contactHandler(){
		let contactDetail = document.createElement("contact-details");
		contactDetail.setDetails(this.taskScope.userDetails);
		document.getElementById("contactDetailsContainer").innerHTML = "";
		document.getElementById("contactDetailsContainer").appendChild(contactDetail);
		clickedElement != undefined && clickedElement.classList.remove("active");
		clickedElement = this.taskScope.contactComponent;
		this.taskScope.contactComponent.classList.add("active");
	}
});
customElements.define('contact-details',
	class extends HTMLElement {
		constructor() {
			super();
			let shadow = this.attachShadow({mode: 'open'});
			shadow.appendChild(document.getElementById("contactDetailTemplate").content.cloneNode(true));
			this.imageContainer = this.shadowRoot.querySelector('#profilePic');
			this.ratingSContainer = this.shadowRoot.querySelector('#ratings');
			this.descriptionContainer = this.shadowRoot.querySelector('#contactDescription');
			this.tableContainer = this.shadowRoot.querySelector('#contactTable');
			this.sendMessage = this.shadowRoot.querySelector('.button');
			this.sendMessage.addEventListener('click',()=>alert("Message Sent!!"));
		}
		setDetails(user){
			this.imageContainer.src  = user.img;
			this.descriptionContainer.textContent = user.Description;
			let ratingList ="";
			for(let i=1;i<=5;++i){
				if(i <= user.rating){
					ratingList+=`<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAABpElEQVRIieXWQWsTQRjG8d+GUkJPxVMJUnIQKR6keC6i9S5+AA9+Kw8iCFL6KUR6KOJJigoGDyqI0It40xCS8ZC3Zdhskt02aQ59lxdmZ555/jPw7uwUSbKKaK2Eei3Ba1WdhaKNDrq4iRG+4Dt+J2lU0rdwI/Q7xhv6GfpfSfo3AUmlJya+wClSln0c4ynWM/169B1jUJpzGl63JziZQQt76GFYMigv4DVuRR5E3zT9MDz30KoCb+JohkGeA7zD+zmLzPMIm1XgJzUNLpOPz3h5VT+cKIDFx6OzRg7evgLwOSMHjyqES4scfHIFvE/nray4dvHX8gqrj3tVVd3GS/U/jyY5DO/2BDjgd/B5CeCP2Kk8uTL4A/xYIPQb7k89MjPwWsB7C4B+xb7sqJwKLu38MvAe9qf6TxsIeBcfLgA9QXem96zBgN/FG/WqfYi32J3rO08Q8O0a8GFoZu60ETjgWzg0+bNP0XeIrdp+dYUB7xhfAgYl6AE6jbyaiAO+gefGR2A/2htNfYowaxSFYhPP4vVVkv409rgIeBFx/S70KwP/B0/WfTGYl4nHAAAAAElFTkSuQmCC"/>`;
				} else {
					ratingList+=`<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAC7ElEQVRIieWWv2tUQRDHP98jBLEQsbCQZwj3jmBpIUEsQsTeNCJCioipxDJ/gYWVpBYLfxQikkbwDxALsbJRJISQO0I8RCzESiSE97W43Zd9797FiwgpnGbvdmfnM292ZnZlzFFI60io/yV4omnyc7d3TPYZpGnbGVIh2AC2ge9Z3i5S/X6317J9StK04ZzsFlLfsC34kuXtX3WG6snV7/bOASuGq8BpAbYR7BreS3oArGV5ezfoTwLXsW8jzQIT2CCB/Q3pFXA/y9ubjeD+VreFdAl4BHRIjsE2kuLfXew1w90wdxe4ZpjU/gYsIRtDIdhCWsZ+l3Xyoh7qE8A97Jng7cBrQFIJtz0p6YagY7sl6QLQChAEONkvaGHPYN+ztAD8gGpyzRvmHGDl6EFEREUmsC8KZm23UicJXxoj5DCHNCeYiwb2wdLlGKbBGbg0FMdw1hVR4mB9LTocnTdcGQbDlBJQmnKOm9VkerREYOLE1BDYUATtCjB6XZ57zSFSndpajEaTuyVY8CEqx1FxUxJG1x2KYQz70rX4O+YL9qchMPBK8At7UAZNXy6VDoWJMnmUOFsuVxNzF+llE3gDeI5UREhd6veYR+g16BbAM2B9CBza2iqwUT9PJRltu2wQVZKrayEZQ/jXbd9PW2flksjy9jpwB9g5sI5jrSawUXUMbMu+c7aTb6Qmmm6nt7aXBJtl8YfxsHVse0uwjPS2Dhm6JKL0u7154KFhJlgpv6ZyFOF3bJdJu920fftsJ3/dZH8kOMCngZfY5+O5pcbL5KpVgKSPwEKWt7dH2T7wIRA2LhleKzSYA+tYKiS9sb10EPSPXxyl3+1NAU+A+dLZmLX7t1Yh6Q2w/CcojPn0yfL2DrAIrAF7cT7pdHsarC2OAx0bHOBfGbxMXgB7SR3vYa8hrQSdsWSsUKfS3+oeR1rFvjWwoMfYK1kn/3kYO4cGA/S7vZO2b4Ye/TTL2z8Oa+OvwP9C/r8H/ZGBfwNniYY2VnTuCwAAAABJRU5ErkJggg==">`;
				}	
			}	
			this.ratingSContainer.innerHTML = ratingList;
			this.createTable(user);
		}	
		createTable(user){
			this.tableContainer.innerHTML = "";
			let tableBody = document.createElement("tbody");
			tableBody.innerHTML = `<tr style="background:#c3ccdd;"><td>Likes</td><td>Dislikes</td></tr>`;
			let numberOfRows = user.Likes > user.Dislikes ? user.Likes.length : user.Dislikes.length;
			for (let i = 0; i < numberOfRows; i++) {
				let row = document.createElement("tr");
				for (let j = 0; j < 2; j++) {
				  let cell = document.createElement("td");
				  let textContent = j == 0? user.Likes[i]: user.Dislikes[i];
				  textContent = textContent == undefined?"":textContent;
				  let cellText = document.createTextNode(textContent);
				  cell.appendChild(cellText);
				  row.appendChild(cell);
				}

			tableBody.appendChild(row);
		  }
		  this.tableContainer.appendChild(tableBody);
		}	
	}  
); 
customElements.define('search-component',
	class extends HTMLElement {
		constructor() {
			super();
			this.userList =[];
			let search = `<style>
			.search {
				border: 1px solid #c3ccdd;
				border-radius: 5px;
				height: 28px;
				margin: 50px 0 0 13px;
				padding: 5px 37px 2px 38px;
				width:100%;
				font-style: normal;
				font-weight: normal;
				text-decoration: inherit;
				background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAACY0lEQVQ4jaWUMWtTURzFf+dRggQpIiV0KKUvYt8rFOkHcOgkItipIg4quih+AXEopUMXBZcujiqCH6FLqYuLdbGl+G5A8qRTKUEkSAhFchxeAjFJreIZL//745zzv1wZM6g8CxWkaeAcEGE3gQOkozhNfg5d6JP6gXkWykhL2HeRUuxJpMjQAILsTaQXcZr8OBWYh9oUsGZYFozbBjhGQlCyDVJbsGX7SXUu3T8RmGehbNiQdB/AcCh7G2kX6AAXgSvYM0gA28CtOE2OBoFjBVZLspe7rurAA6SdOE2afVUsIK0Di8Ci4X4eak/jNOn85rAeQgX7leEq0iFwu5omW6Pi5FmYQXoHzGAHpOtxmnzpn4mAaaQUCdnbgp2TCkc6AN5QJKlgLwyORMB5YBL7GGm3F3OUuvE+WGohjSNNDQG7vUUqyu4MDoxQR8Vc5N4O+oGSfhi+ASXgQj0L5ZNIeahFwCx2GWgJhrYcAQfAZwO2rwCX/uBuArjnItmRYW8U8FCwKWhLqkpaz7MwlWch6neWh1oFew2Y79bzHvg8CCwedqiNA2+BawDYX5FeAx+xO0izwD1g3hCp6H3F0vNqmrSGgAB5Fi4hbRguq/gQQGoBHeyye4srzgEa2CtIL+M0afdH7qK1D9wAVg0B+Ga7hF1Gagnqtl8DK9gN2xNIz4CHeaidGXLYUz3UIkEVWACmDGOyG5Y+dTsbk30H6Znts5K+A0+Al3GatIeAf6M81ErAI+xVpHO2A3CzOpfuRaddHqU4TY6xXxgeA0FSAJojI/+L6lk4I5g1NCUdxGnS+S/gKP0CIS8i4nYwM7QAAAAASUVORK5CYII=);
				background-position: 5px 5px;
				background-repeat: no-repeat;
			}
			.awesomeSearch_search_children {
			  height:35px;
			  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAACY0lEQVQ4jaWUMWtTURzFf+dRggQpIiV0KKUvYt8rFOkHcOgkItipIg4quih+AXEopUMXBZcujiqCH6FLqYuLdbGl+G5A8qRTKUEkSAhFchxeAjFJreIZL//745zzv1wZM6g8CxWkaeAcEGE3gQOkozhNfg5d6JP6gXkWykhL2HeRUuxJpMjQAILsTaQXcZr8OBWYh9oUsGZYFozbBjhGQlCyDVJbsGX7SXUu3T8RmGehbNiQdB/AcCh7G2kX6AAXgSvYM0gA28CtOE2OBoFjBVZLspe7rurAA6SdOE2afVUsIK0Di8Ci4X4eak/jNOn85rAeQgX7leEq0iFwu5omW6Pi5FmYQXoHzGAHpOtxmnzpn4mAaaQUCdnbgp2TCkc6AN5QJKlgLwyORMB5YBL7GGm3F3OUuvE+WGohjSNNDQG7vUUqyu4MDoxQR8Vc5N4O+oGSfhi+ASXgQj0L5ZNIeahFwCx2GWgJhrYcAQfAZwO2rwCX/uBuArjnItmRYW8U8FCwKWhLqkpaz7MwlWch6neWh1oFew2Y79bzHvg8CCwedqiNA2+BawDYX5FeAx+xO0izwD1g3hCp6H3F0vNqmrSGgAB5Fi4hbRguq/gQQGoBHeyye4srzgEa2CtIL+M0afdH7qK1D9wAVg0B+Ga7hF1Gagnqtl8DK9gN2xNIz4CHeaidGXLYUz3UIkEVWACmDGOyG5Y+dTsbk30H6Znts5K+A0+Al3GatIeAf6M81ErAI+xVpHO2A3CzOpfuRaddHqU4TY6xXxgeA0FSAJojI/+L6lk4I5g1NCUdxGnS+S/gKP0CIS8i4nYwM7QAAAAASUVORK5CYII=);
			  background-position: 5px 15px;
			  background-repeat: no-repeat;
			  text-overflow:ellipsis;
			  overflow:hidden;
			  white-space:nowrap;
			  padding-left:30px;
			  padding-top: 15px;
			  cursor:pointer;
			}
			.awesomeSearch_search_children:hover{
				background-color:#e0e4ea;
			}	
			#autoSearchContainer{
				position: relative;
				z-index: 1;
				background: white;
				width: 100%;
				margin: 0px 0 0 13px;
				box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
				max-height: 200%;
				overflow-y:auto;
			}	
			</style>
			<input class="search" id="search" type="search" placeholder="Search">`;
			let shadow = this.attachShadow({mode: 'open'});
			shadow.innerHTML = search;
			this.searchComponent = this.shadowRoot.querySelector('#search');
			this.searchComponent.addEventListener("keyup",{
				handleEvent:this.searchHandler,
				taskScope:this
			});
			this.searchComponent.addEventListener("blur",(e) =>{
				let autoContainer = this.shadowRoot.querySelector("#autoSearchContainer");
				if( autoContainer && autoContainer.querySelectorAll( ":hover" ).length == 0){
					autoContainer.style.display = "none";
				}	
			});
		}
		setUserList(list){
			this.userList = list;	
		}	
		searchHandler(e){
			let inputValue = this.taskScope.searchComponent.value.toLowerCase();
			let autoContainer = this.taskScope.shadowRoot.querySelector("#autoSearchContainer");
			if(e.key == undefined || e.key.toLowerCase() ==="enter"){
				this.taskScope.setAttribute("data-value",inputValue);
			} else {
				if(inputValue == ""){
					autoContainer && this.taskScope.shadowRoot.removeChild(autoContainer);
				} else {
					let list = this.taskScope.userList.filter((item)=>{
						return item.name.toLowerCase().includes(inputValue);
					});
					let searchChildren ="";
					let newElement = document.createElement("div");
					newElement.id= "autoSearchContainer";
					for(let i =0; i< list.length ;++i){
						searchChildren += `<div class='awesomeSearch_search_children'>${list[i].name}</div>`
					}
					newElement.innerHTML = searchChildren;
					autoContainer && this.taskScope.shadowRoot.removeChild(autoContainer);
					newElement.addEventListener("click",(e) =>{
						if (e.target !== e.currentTarget) {
							this.taskScope.setAttribute("data-value",e.target.textContent);
							this.taskScope.searchComponent.value = e.target.textContent;
							newElement.remove();
							this.taskScope.searchComponent.focus();
							this.taskScope.searchComponent.dispatchEvent(new CustomEvent("keyup"));
						}
						e.stopPropagation();
					});
					this.taskScope.shadowRoot.appendChild(newElement);
				}	
			}	
		}		
	}
);	
new userDirectoryApp();