// Import necessary assets (icons)
import editIcon from "~/assets/edit.svg";
import insertIcon from "~/assets/insert.svg";
import generateIcon from "~/assets/generate.svg";
import regenerateIcon from "~/assets/regenerate.svg";

// Main content script definition, targeting LinkedIn pages
export default defineContentScript({
  matches: ["*://*.linkedin.com/*"], // Matches LinkedIn domain URLs
  main() {
    // Inject Modal HTML directly
    const modalHtml = `
      <div id="custom-modal" style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: none; justify-content: center; align-items: center; z-index: 4000;">
        <div id="modal-content" style="background: white; border-radius: 8px; width: 100%; max-width: 570px; padding: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div id="messages" style="margin-top: 10px; max-height: 200px; overflow-y: auto; padding: 10px; display: flex; flex-direction: column; gap: 5px;"></div>
          <div style="margin-bottom: 10px;">
            <input id="input-text" type="text" placeholder="Enter your prompt..." style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"/>
          </div>
          <div style="text-align: right; margin-top: 12px;">
            <button id="insert-btn" style="background: #fff; color: #666D80; padding: 8px 16px; border: 2px solid #666D80; border-radius: 4px; cursor: pointer; display: none; margin-right: 10px;">
              <img src="${insertIcon}" alt="Insert" style="vertical-align: middle; margin-right: 5px; width: 14px; height: 14px;"> 
              <b>Insert</b>
            </button>
            <button id="generate-btn" style="background: #007bff; color: white; padding: 8px 16px; border: 2px solid #007bff; border-radius: 4px; cursor: pointer;">
              <img src="${generateIcon}" alt="Generate" style="vertical-align: middle; margin-right: 5px; width: 14px; height: 14px;"> 
              <b>Generate</b>
            </button>
          </div>
        </div>
      </div>
    `;

    // Inject modal into DOM
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Cache modal elements
    const modal = document.getElementById("custom-modal") as HTMLDivElement;
    const generateBtn = document.getElementById(
      "generate-btn"
    ) as HTMLButtonElement;
    const insertBtn = document.getElementById(
      "insert-btn"
    ) as HTMLButtonElement;
    const inputText = document.getElementById("input-text") as HTMLInputElement;
    const messagesDiv = document.getElementById("messages") as HTMLDivElement;

    let lastGeneratedMessage = "";
    let parentElement: HTMLElement | null = null;

    // Utility function to apply styles to elements
    const applyStyles = (
      element: HTMLElement,
      styles: { [key: string]: string }
    ) => {
      Object.assign(element.style, styles);
    };

    // Event listener to detect clicks on LinkedIn message input areas
    document.addEventListener("click", (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        target.matches(".msg-form__contenteditable") ||
        target.closest(".msg-form__contenteditable")
      ) {
        parentElement =
          target.closest(".msg-form__container") ||
          target.closest(".msg-form__contenteditable");

        if (parentElement && !parentElement.querySelector(".edit-icon")) {
          parentElement.style.position = "relative";

          const icon = document.createElement("img");
          icon.className = "edit-icon";
          icon.src = editIcon;
          icon.alt = "Custom Icon";
          applyStyles(icon, {
            position: "absolute",
            bottom: "5px",
            right: "5px",
            width: "30px",
            height: "30px",
            cursor: "pointer",
            zIndex: "1000",
          });
          parentElement.appendChild(icon);

          icon.addEventListener("click", (e) => {
            e.stopPropagation();
            modal.style.display = "flex";
          });
        }
      }
    });

    // Generate a fixed message for now
    const generateMessage = () =>
      "Thank you for the opportunity! If you have any more questions or if there's anything else I can help you with, feel free to ask.";

    // Handle the 'Generate' button click
    generateBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      const inputValue = inputText.value.trim();
      if (!inputValue) {
        alert("Please enter a prompt.");
        return;
      }

      const userMessageDiv = document.createElement("div");
      userMessageDiv.textContent = inputValue;
      applyStyles(userMessageDiv, {
        backgroundColor: "#DFE1E7",
        color: "#666D80",
        borderRadius: "12px",
        padding: "10px",
        textAlign: "right",
        maxWidth: "80%",
        marginLeft: "auto",
      });
      messagesDiv.appendChild(userMessageDiv);

      generateBtn.disabled = true;
      generateBtn.textContent = "Loading...";
      generateBtn.style.backgroundColor = "#666D80";

      setTimeout(() => {
        lastGeneratedMessage = generateMessage();
        const generatedMessageDiv = document.createElement("div");
        generatedMessageDiv.textContent = lastGeneratedMessage;
        applyStyles(generatedMessageDiv, {
          backgroundColor: "#DBEAFE",
          color: "#666D80",
          borderRadius: "12px",
          padding: "10px",
          textAlign: "left",
          maxWidth: "80%",
        });

        messagesDiv.appendChild(generatedMessageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

        generateBtn.disabled = false;
        generateBtn.textContent = "Regenerate";
        generateBtn.style.backgroundColor = "#007bff";

        insertBtn.style.display = "inline-block";
        inputText.value = "";
      }, 500);
    });

    insertBtn.addEventListener("click", () => {
      if (lastGeneratedMessage && parentElement) {
        const existingParagraph =
          parentElement.querySelector("p") || document.createElement("p");
        existingParagraph.textContent = lastGeneratedMessage;
        parentElement.appendChild(existingParagraph);

        insertBtn.style.display = "none";
        modal.style.display = "none";
      }
    });

    // Close modal when clicking outside
    document.addEventListener("click", (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        modal.style.display === "flex" &&
        !modal.contains(target) &&
        !target.classList.contains("edit-icon")
      ) {
        modal.style.display = "none";
      }
    });
  },
});
