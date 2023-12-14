import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const TextUpload = () => {
  const content = document.getElementById("content");
  const [textFile, setTextFile] = useState(null);
  const [highlightedText, setHighlightedText] = useState("");
  const [language, setLanguage] = useState("");

  const handleSelection = async () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== "") {
      const selectedText = selection.toString();

      // Perform translation when text is highlighted
      if (language) {
        try {
          const translationData = {
            translation: selectedText,
            language,
            source: "EN",
          };
          const response = await axios.post("/translate", translationData);
          setHighlightedText(response.data.translations[0].text);
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const handleChange = (e) => {
    setTextFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!textFile) {
      console.log(`No file selected.`);
      toast.error(`Please choose a file to upload.`);
      return;
    } else if (textFile.type !== "text/plain") {
      toast.error(`Please select a Plain Text file (.txt) instead.`);
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      content.innerText = reader.result;
    });

    if (textFile) {
      reader.readAsText(textFile);
    }
  };

  return (
    <>
      <div
        onMouseUp={() => {
          setTimeout(handleSelection, 0); // Add a small delay to allow the selection to be updated
        }}
      >
        <p>
          Select and highlight text in this component to see it displayed below:
        </p>
        {highlightedText && <p>Highlighted Text: {highlightedText}</p>}
        <form>
          <br></br>

          <select onChange={(e) => setLanguage(e.target.value)}>
            <option selected default disabled>
              --Choose a Language--
            </option>
            <option value="BG">Bulgarian</option>
            <option value="CS">Czech</option>
            <option value="DA">Danish</option>
            <option value="DE">German</option>
            <option value="EL">Greek</option>
            <option value="ES">Spanish</option>
            <option value="ET">Estonian</option>
            <option value="FI">Finnish</option>
            <option value="FR">French</option>
            <option value="HU">Hungarian</option>
            <option value="ID">Indonesian</option>
            <option value="IT">Italian</option>
            <option value="JA">Japanese</option>
            <option value="KO">Korean</option>
            <option value="LT">Lithuanian</option>
            <option value="LV">Latvian</option>
            <option value="NB">Norwegian (Bokmål)</option>
            <option value="NL">Dutch</option>
            <option value="PL">Polish</option>
            <option value="PT">Portuguese</option>
            <option value="RO">Romanian</option>
            <option value="RU">Russian</option>
            <option value="SK">Slovak</option>
            <option value="SL">Slovenian</option>
            <option value="SV">Swedish</option>
            <option value="TR">Turkish</option>
            <option value="UK">Ukrainian</option>
            <option value="ZH">Chinese</option>
          </select>
        </form>
        <h3>Would you like to translate a file?</h3>
        <h4>Please select a file to upload.</h4>
        <h3>Please Upload a Plain Text File</h3>

        <form onSubmit={handleSubmit}>
          <label htmlFor="upload">Upload a File: </label>
          <input type="file" name="upload" onChange={handleChange} />
          <br></br>
          <button type="submit">Upload</button>
        </form>

        <br></br>

        <p id="content"> No Text Uploaded</p>

        <br></br>

        <Link to="/translate">Select a New File</Link>
      </div>
    </>
  );
};

export default TextUpload;
