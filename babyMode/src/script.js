var invoke = window.__TAURI__.invoke;
var dialog = window.__TAURI__.dialog;

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
function fileselect(isDirMode, defaultp) {
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
    document.getElementById('folderInput').value = pathStr;
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
        label: "Download Liblcf Repository ( 4mb+ )",
        inputType: "checkbox",
        inputId: "liblcfRepo",
        checked: true
      },
      {
         label: "Liblcf Task:",
        inputType: "checkbox+select",
        inputId: "toolchainTask",
        checked: true,
        options: [
          {
            value: "download_prebuilt.cmd",
            text: "Download prebuilt Toolchain ( 400mb+ )"
          },
          {
            value: "build.cmd",
            text: "Build Toolchain from scratch (30 minutes process)"
          }
        ]
      },
      {
        label: "Update Environment Variables",
        inputType: "checkbox",
        inputId: "updateEnvVariables",
        checked: true,
        output: "setup_env.cmd"
      }
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
      }
    ]
  }
};

let fileInput;
function openFolderDialog() {
  var element = document.getElementById('blackOverlay').style.display = 'block';
  const isFolder = true;
  const startFolder = document.getElementById("folderInput").value ? document.getElementById("folderInput").value : document.getElementById("folderInput").placeholder;
  fileselect(isFolder, startFolder);
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

        if (item.inputId === "folderInput") {
          const selectButton = document.createElement("button");
          selectButton.textContent = "Select Folder";
          selectButton.onclick = openFolderDialog; // Assuming you have the openFolderDialog() function defined elsewhere
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
    "toolchainTasks":[],
    "postInstall": {
      "openProject": document.getElementById("runIt").checked
    }
  };

  if (document.getElementById("toolchainTask").checked) output.toolchainTasks.push(document.getElementById("toolchainTaskSelect").value);
  if(document.getElementById("updateEnvVariables").checked) output.toolchainTasks.push(document.getElementById("updateEnvVariables").getAttribute("output"));

  if (document.getElementById("gitInstall").checked) output.download["winget install"].push("git.git --silent");
  if(document.getElementById("vsComInstall").checked) output.download["winget install"].push(`Microsoft.VisualStudio.2022.Community --silent --override "--wait --passive --addProductLang En-us --add Microsoft.VisualStudio.Workload.NativeDesktop --includeRecommended"`);
  //if( document.getElementById("vsBtInstall").checked) output.download["winget install"].push(`Microsoft.VisualStudio.2022.BuildTools --silent --override "--wait --passive --addProductLang En-us --add Microsoft.VisualStudio.Workload.NativeDesktop --includeRecommended"`);

if(document.getElementById("playerRepo").checked) output.download["git clone"].push("-b windows/helper https://github.com/Ghabry/easyrpg-buildscripts.git")
if(document.getElementById("liblcfRepo").checked) output.download["git clone"].push("https://github.com/EasyRPG/Player.git")

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