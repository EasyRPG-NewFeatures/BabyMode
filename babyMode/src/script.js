var invoke = window.__TAURI__.invoke;
var dialog = window.__TAURI__.dialog;


const dialogPrompt = {
  el: document.getElementById("dialog"),
  hintEl: document.getElementById("hint"),
  inputEl: document.getElementById("input"),
  branchEl: document.getElementById("inputBranch"),
  folderEl: document.getElementById("inputFolder"),
  blackOverlayEl: document.getElementById("blackOverlay"),
  defaultInput: {},
  outputFn: null,

  show: function (hint, def, curr, outputFn) {
    this.hintEl.innerHTML = hint;
    this.inputEl.value = curr.url;
    this.branchEl.value = curr.branch;
    this.folderEl.value = curr.folder;
    this.defaultInput = { ...def };
    this.outputFn = outputFn;
    
    this.el.style.display = "block";
    this.blackOverlayEl.style.display = "block";
  },

  ok: function () {
    this.el.style.display = "none";
    
    var output = {
      url: this.inputEl.value,
      branch: this.branchEl.value,
      folder: this.folderEl.value
    };
    
    this.blackOverlayEl.style.display = "none";
    
    if (typeof this.outputFn === "function") {
      this.outputFn(output);
    }
  },

  cancel: function () {
    this.el.style.display = "none";
    this.blackOverlayEl.style.display = "none";
  },

  reset: function () {
    this.inputEl.value = this.defaultInput.url;
    this.branchEl.value = this.defaultInput.branch;
    this.folderEl.value = this.defaultInput.folder;
  }
};


function callRust() {
  invoke('call_rust', { jsMsg: 'Hello from JS' })
    .then(function (rustMsg) {
      console.log("Message from Rust: " + rustMsg);
    });
}

// Send the increment/decrement value to the 'counter' function in Rust and update the HTML with the return value
function counter(countVal) {
  invoke('counter', { countVal: countVal })
    .then(function (resultVal) {
      document.getElementById('counter').innerHTML = String(resultVal);
    });
}

// File selection dialog
function fileselect(folderEl,isDirMode, defaultp) {
  var properties = {
    defaultPath: defaultp,
    directory: isDirMode,
    filters: [{
      extensions: [],
      name: "*"
    }],
  };
  dialog.open(properties).then(function (pathStr) {
    if (!pathStr) pathStr = defaultp;
    folderEl.value = pathStr;
    var element = document.getElementById('blackOverlay').style.display = 'none';
  });
}


// Your JSON containing the settings data
const settingsData = {
  1: {
    title: "Building Settings",
    items: [
      {
        label: "Install Folder:",
        inputType: "text",
        inputId: "folderInput",
        inputPlaceholder: "C:\\EasyRPG",
        readonly: true
      },
      {
        label: "Build Target:",
        inputType: "select",
        inputId: "cmakeforOpt",
        options: [
          {
            value: "windows-x64-vs2022",
            text: "Windows Application (x64)"
          },
          {
            value: "windows-x86-vs2022",
            text: "Windows Application (x86)"
          },
          {
            value: "windows-x64-vs2022-libretro",
            text: "Libretro Core (x64)"
          },
          {
            value: "windows-x86-vs2022-libretro",
            text: "Libretro Core (x86)"
          }
        ]
      },
      {
        label: "Build Type:  .",
        inputType: "select",
        inputId: "buildTypeOpt",
        options: [
          {
            value: "debug",
            text: "Debug"
          },
          {
            value: "release",
            text: "Release"
          },
          {
            value: "relwithdebinfo",
            text: "Release (+ debug symbols)"
          }
        ]
      },
      {
        inputType: "separator"
      },
      {
        label: "Skip content that is already installed",
        inputType: "checkbox",
        inputId: "skipOverride",
        checked: true
      }
    ]
  },
  2: {
    title: "Download & Install Building Tools",
    items: [
      {
        label: "GIT ( 58mb+ )",
        inputType: "checkbox",
        inputId: "gitInstall",
        checked: true
      },
      {
        label: "Visual Studio 2022 - Community Editor ( 2.5gb+ )",
        inputType: "checkbox",
        inputId: "vsComInstall",
        checked: true
      },
      // {
      //   label: "Build Tools for Visual Studio",
      //   inputType: "checkbox",
      //   inputId: "vsBtInstall",
      //   checked: true
      // }
      
    ]
  },
  3: {
    title: "Setup Required Libraries",
    items: [
      {
        label: "Download EasyRPG Player Repository ( 39mb+ )",
        inputType: "checkbox",
        inputId: "playerRepo",
        checked: true
      },{
        inputType: "separator"
      },
      {
        label: "Download buildScripts Repository ( 4mb+ )",
        inputType: "checkbox",
        inputId: "buildScriptsRepo",
        checked: true
      },
      {
         label: "BuildScripts Task:",
        inputType: "checkbox+select",
        inputId: "liblcfTask",
        checked: true,
        options: [
          {
            value: "download_prebuilt.cmd",
            text: "Download prebuilt liblcf ( 400mb+ )"
          },
          {
            value: "build.cmd",
            text: "Build liblcf from scratch (30 minutes process)"
          }
        ]
      },
      // {
      //   label: "Update Environment Variables",
      //   inputType: "checkbox",
      //   inputId: "updateEnvVariables",
      //   checked: true,
      //   output: "setup_env.cmd"
      // }
    ]
  },
  4: {
    title: "After Installing",
    items: [
      {
        label: "Open Player Project",
        inputType: "checkbox",
        inputId: "runIt",
        checked: true
      },
      {
        label: "Play Games From:",
        inputType: "text",
        inputId: "gamesInput",
        inputPlaceholder: "C:\\EasyRPG",
        readonly: true
      }
    ]
  }
};

var repos = {
  libDefault:  {},
  playerDefault: {},
  lib:{url:"https://github.com/EasyRPG/buildscripts.git",branch:"master",folder:"buildScripts"},
  player:{url:"https://github.com/EasyRPG/Player.git", branch:"master",folder:"Player"}
 };

 repos.libDefault = repos.lib;
 repos.playerDefault = repos.player;

let fileInput;
function openFolderDialog(output) {
  var element = document.getElementById('blackOverlay').style.display = 'block';
  const isFolder = true;
  const startFolder = output.value ? output.value : output.placeholder;
  fileselect(output, isFolder, startFolder);
}

// Function to dynamically create settings based on the JSON data
function createSettings() {
  const settingsContainer = document.getElementById("settingsContainer");
  const separator = document.createElement("div");
  separator.className = "separator";

  Object.entries(settingsData).forEach(([num, setting]) => {
    const fieldset = document.createElement("fieldset");
    const legend = document.createElement("legend");
    legend.innerHTML = `<b>${num}. ${setting.title}</b>`;
    fieldset.appendChild(legend);

    setting.items.forEach((item) => {
      const label = document.createElement("label");
      label.setAttribute("for", item.inputId);
      label.innerHTML = `${item.label}`;

      // Handle the separator
      if (item.inputType === "separator") {
        fieldset.appendChild(separator.cloneNode());
      }

      if (item.inputType === "text") {
        const input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("id", item.inputId);
        input.setAttribute("placeholder", item.inputPlaceholder);
        input.disabled = item.readonly || false;

        if (item.inputId === "folderInput" || item.inputId === "gamesInput" ) {
          const selectButton = document.createElement("button");
          selectButton.textContent = "Select Folder";
          selectButton.onclick = function(){;openFolderDialog(selectButton.previousSibling)};
          fieldset.appendChild(label);
          fieldset.appendChild(input);
          fieldset.appendChild(selectButton);
        } else {
          fieldset.appendChild(label);
          fieldset.appendChild(input);
        }
      } else if (item.inputType === "checkbox+select") {

      // Checkbox
      const checkboxLabel = document.createElement("label");
      checkboxLabel.setAttribute("for", item.inputId);
      checkboxLabel.innerHTML = `${item.label}`;

      const checkbox = document.createElement("input");
      checkbox.setAttribute("type", "checkbox");
      checkbox.setAttribute("id", item.inputId);
      checkbox.checked = item.checked || false;
  

      fieldset.append(checkbox);

      // Select
      const select = document.createElement("select");
      select.setAttribute("id", item.inputId + "Select");

      item.options.forEach((option) => {
        const optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.text = option.text;
        select.appendChild(optionElement);
      });

      fieldset.appendChild(checkboxLabel);
      fieldset.appendChild(select);

      ; // Skip the next iteration as it has already been handled here
    } else if (item.inputType === "checkbox") {
        const input = document.createElement("input");
        input.setAttribute("type", "checkbox");
        input.setAttribute("id", item.inputId);
        input.checked = item.checked || false;
        if (item.output) input.setAttribute("output", item.output);

        fieldset.appendChild(input);
        fieldset.appendChild(label);
      } else if (item.inputType === "select") {
        const select = document.createElement("select");
        select.setAttribute("id", item.inputId);

        item.options.forEach((option) => {
          const optionElement = document.createElement("option");
          optionElement.value = option.value;
          optionElement.text = option.text;
          select.appendChild(optionElement);
        });

        fieldset.appendChild(label);
        fieldset.appendChild(select);
      }

      fieldset.appendChild(document.createElement("br"));
    });

    settingsContainer.appendChild(fieldset);
    settingsContainer.appendChild(document.createElement("br"));
  });

  repos.player = repos.playerDefault
  repos.lib = repos.libDefault
  document.getElementById("gamesInput").nextSibling.style.display =
  document.getElementById("gamesInput").previousSibling.style.display =
  document.getElementById("gamesInput").style.display = "none";

  playerRepo.nextSibling.innerHTML  =   playerRepo.nextSibling.innerHTML  + " <button id='PlayerPath'> ... </button>"
  buildScriptsRepo.nextSibling.innerHTML  =   buildScriptsRepo.nextSibling.innerHTML  + " <button id='libPath'> ... </button>"

  document.getElementById("PlayerPath").addEventListener("click", function() {
    dialogPrompt.show("Player's Repository", repos.playerDefault, repos.player, function(value) {
      repos.player =  value;
    });
  });

  document.getElementById("libPath").addEventListener("click", function() {
    dialogPrompt.show("BuildScripts's Repository", repos.libDefault,repos.lib, function(value) {
      repos.lib =  value;
    });

    
  });

}

// Call the function to create the settings on page load
createSettings();

// Helper function to get the values of all input elements
function getInputValues() {
  var output =  {
    "buildSettings": {
      "folder": document.getElementById("folderInput").value ? document.getElementById("folderInput").value : document.getElementById("folderInput").placeholder,
      "target": document.getElementById("cmakeforOpt").value +"-"+ document.getElementById("buildTypeOpt").value,
      "overrideFiles": !document.getElementById("skipOverride").checked
    },
    "download":{
      "winget install": [],
    "git clone": []
  },
    "liblcfTasks":[],
    "postInstall": {
      "openProject": document.getElementById("runIt").checked,
      "gamesFolder": document.getElementById("gamesInput").value ? document.getElementById("gamesInput").value : document.getElementById("gamesInput").placeholder,
    }
  };

  if (document.getElementById("liblcfTask").checked) output.liblcfTasks.push(document.getElementById("liblcfTaskSelect").value);
  if(document.getElementById("liblcfTask").checked) output.liblcfTasks.push("setup_env.cmd");

  if (document.getElementById("gitInstall").checked) output.download["winget install"].push("git.git --silent");
  if(document.getElementById("vsComInstall").checked) output.download["winget install"].push(`Microsoft.VisualStudio.2022.Community --silent --override "--wait --passive --addProductLang En-us --add Microsoft.VisualStudio.Workload.NativeDesktop --includeRecommended"`);
  
if(document.getElementById("playerRepo").checked) output.download["git clone"].push("-b " +repos.player.branch + " " + repos.player.url + " " + repos.player.folder)
if(document.getElementById("buildScriptsRepo").checked) output.download["git clone"].push("-b " +repos.lib.branch + " " + repos.lib.url + " " + repos.lib.folder)

  return output;

}

// Function to reset all input elements to their default starting values
function resetInputs() {
  var element = document.getElementById('blackOverlay').style.display = 'block';
  document.getElementById("settingsContainer").innerHTML = "";
  createSettings();
  var element = document.getElementById('blackOverlay').style.display = 'none';
}

function installIt() {
  let inputs = getInputValues();
  //inputs = JSON.stringify(inputs,"\n",2)
  inputs = genStart(inputs) +`\n` + genFinish(inputs);
  invoke('call_rust', { jsMsg: inputs, env: updateEnvVars() });
}