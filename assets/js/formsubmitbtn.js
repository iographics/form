const formInput = document.querySelector('#item1118249','#item18249','#item118249','#item18245','#email','#item18248','#item18242');
const formButton = document.querySelector("#submit");

// the default state is 'disabled'
formButton.disabled = true; 

// alternative is to use "change" - explained below
formInput.addEventListener("keyup", buttonState);

function buttonState() {
    if (document.querySelector('#item1118249','#item18249','#item118249','#item18245','#email','#item18248','#item18242').value === "") {
        formButton.disabled = true; // return disabled as true whenever the input field is empty
    } else {
        formButton.disabled = false; // enable the button once the input field has content
    }
}

// just verifying that the button has been clicked
formButton.addEventListener("click", () => {
console.log("  ", document.querySelector('#item1118249','#item18249','#item118249','#item18245','#email','#item18248','#item18242').value);
})

formInput.addEventListener("keyup", (e) => {
    const value = e.currentTarget.value;
    formButton.disabled = false;

    if (value === "") {
        formButton.disabled = true;
    }
})

