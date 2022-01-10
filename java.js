const colordivs = document.querySelectorAll(".color");
const generatbtn = document.querySelector(".genarate");
const sliders = document.querySelectorAll('input[type="range"]');
const currhex = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
let initialColor;
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closeAdjust = document.querySelectorAll(".close-adjust");
const slidersContainer = document.querySelectorAll(".slider");
//this is for local storage
let savedPalettes = [];

generatbtn.addEventListener("click", randomcolors);
function generathex() {
  const hexcolor = chroma.random();
  return hexcolor;
}

sliders.forEach((slider) => {
  slider.addEventListener("input", hslcontrols);
});

colordivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUl(index);
  });
});
currhex.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClopboard(hex);
  });
});
popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});
adjustButton.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustPanel(index);
  });
});

closeAdjust.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustPanel(index);
  });
});

lockButton.forEach((button, index) => {
  button.addEventListener("click", (e) => {
    lockLayer(e, index);
  });
});
function randomcolors() {
  initialColor = [];
  colordivs.forEach((div, index) => {
    const hextext = div.children[0];
    const randomcolor = generathex();

    // add to array
    if (div.classList.contains("locked")) {
      initialColor.push(hextext.innerText);
      return;
    } else {
      initialColor.push(chroma(randomcolor).hex());
    }

    div.style.background = randomcolor;
    hextext.innerText = randomcolor;
    checkconstrat(randomcolor, hextext);

    const color = chroma(randomcolor);
    const slider = div.querySelectorAll(".slider input");
    // console.log(slider);
    // console.log(slider);
    const hue = slider[0];
    const brigh = slider[1];
    const sat = slider[2];
    colorize(color, hue, brigh, sat);
  });

  resetInputs();

  //check for btn contracts
  adjustButton.forEach((button, index) => {
    checkconstrat(initialColor[index], button);
    checkconstrat(initialColor[index], lockButton[index]);
  });
}

function checkconstrat(color, text) {
  const lumanance = chroma(color).luminance();
  if (lumanance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorize(color, hue, brigh, sat) {
  const nosat = color.set("hsl.s", 0);
  const fullsat = color.set("hsl.s", 1);
  const scalesat = chroma.scale([nosat, color, fullsat]);

  const midbrigh = color.set("hsl.l", 0.5);
  const scalebrigh = chroma.scale(["black", midbrigh, "white"]);
  //Update Input Colors
  sat.style.backgroundImage = `linear-gradient(to right,${scalesat(
    0
  )}, ${scalesat(1)})`;
  brigh.style.backgroundImage = `linear-gradient(to right,${scalebrigh(
    0
  )},${scalebrigh(0.5)} ,${scalebrigh(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslcontrols(e) {
  const index =
    e.target.getAttribute("data-brigth") ||
    e.target.getAttribute("data-sat") ||
    e.target.getAttribute("data-hue");
  console.log(index);

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');

  const sat = sliders[2];
  const hue = sliders[0];
  const brigh = sliders[1];
  const bgcolor = initialColor[index];
  let color = chroma(bgcolor)
    .set("hsl.s", sat.value)
    .set("hsl.l", brigh.value)
    .set("hsl.h", hue.value);

  colordivs[index].style.backgroundColor = color;

  colorize(color, hue, brigh, sat);
}

function updateTextUl(index) {
  const activeDiv = colordivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controlor button");
  textHex.innerText = color.hex();
  checkconstrat(color, textHex);
  for (icon of icons) {
    checkconstrat(color, icon);
  }
}
function resetInputs() {
  const sliders = document.querySelectorAll(".slider input");
  // console.log(initialColor);
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColor[slider.getAttribute("data-hue")];
      const huevalue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(huevalue);
    }

    if (slider.name === "brightness") {
      const brighColor = initialColor[slider.getAttribute("data-brigth")];
      const brighvalue = chroma(brighColor).hsl()[2];
      slider.value = Math.floor(brighvalue * 100) / 100;
    }

    if (slider.name === "saturation") {
      const satColor = initialColor[slider.getAttribute("data-sat")];
      const satvalue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satvalue * 100) / 100;
    }
  });
}

function copyToClopboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}
function openAdjustPanel(index) {
  slidersContainer[index].classList.toggle("active");
}

function closeAdjustPanel(index) {
  slidersContainer[index].classList.remove("active");
}

function lockLayer(e, index) {
  const lockSVG = e.target.children[0];
  const activeBg = colordivs[index];
  activeBg.classList.toggle("locked");

  if (lockSVG.classList.contains("fa-lock-open")) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

//implements save to palette
const saveBtn = document.querySelector(".save");
const submutSave = document.querySelector(".save-submit");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libraryCont = document.querySelector(".library-container");
const libraryBtn = document.querySelector(".library");

const closelibraryBtn = document.querySelector(".close-library");

saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submutSave.addEventListener("click", savepalette);
libraryBtn.addEventListener("click", openLibrary);
closelibraryBtn.addEventListener("click", closeLibrary);
function openPalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.add("active");
  popup.classList.add("active");
}

function closePalette(e) {
  const popup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  popup.classList.add("remove");
}
function savepalette(e) {
  saveContainer.classList.remove("active");
  popup.classList.remove("active");
  const name = saveInput.value;
  const color = [];
  currhex.forEach((hex) => {
    color.push(hex.innerText);
  });
  //generate obj
  let paletteNr;
  const palettObj = JSON.parse(localStorage.getItem("palettes"));
  if (palettObj) {
    paletteNr = palettObj.length;
  } else {
    paletteNr = savepalette.length;
  }

  const paletteObj = { name, color, nr: paletteNr };
  savedPalettes.push(paletteObj);
  //save to local
  saveToLocal(paletteObj);
  saveInput.value = "";
  //generate the palette for library
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.color.forEach((smallcolor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = smallcolor;
    preview.appendChild(smallDiv);
  });
  ``;
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-pal-btn");

  paletteBtn.classList.add(paletteObj.nr);
  paletteBtn.innerText = "select ";

  //attach event
  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const palIndex = e.target.classList[1];
    initialColor = [];
    savedPalettes[palIndex].color.forEach((color, index) => {
      initialColor.push(color);
      colordivs[index].style.backgroundColor = color;
      const text = colordivs[index].children[0];
      checkconstrat(color, text);
      updateTextUl(index);
    
    });
   
    resetInputs();
  });

  //append to library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryCont.children[0].appendChild(palette);
}

function saveToLocal(paletteObj) {
  let localpal;
  if (localStorage.getItem("palettes") === null) {
    localpal = [];
  } else {
    localpal = JSON.parse(localStorage.getItem("palettes"));
  }
  localpal.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localpal));
}

function openLibrary() {
  const popup = libraryCont.children[0];
  libraryCont.classList.add("active");
  popup.classList.add("active");
}

function closeLibrary() {
  const popup = libraryCont.children[0];
  libraryCont.classList.remove("active");
  popup.classList.remove("active");
}
function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    localStorage = [];
  } else {
    const palobject = JSON.parse(localStorage.getItem("palettes"));
    savedPalettes = [...palobject];
    palobject.forEach((paletteObj) => {});
  }
}
randomcolors();
localStorage.clear();
