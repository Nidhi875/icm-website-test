/* ==========================================================
   STAFF LMS - MESSAGES PAGE
   PART 1: INITIALISATION + DATABASE MESSAGES
========================================================== */

(() => {
    "use strict";

    const API_URL = "https://icm-website-test-production.up.railway.app/api/messages";

    let messages = [];
    let currentConversation = "staff-general";
    let currentFilter = "all";

    document.addEventListener("DOMContentLoaded", init);

    async function init() {

        console.log("MESSAGES JS STARTED");

        bindMessageInput();
        bindConversationSearch();
        bindConversationTabs();

        bindConversationItems();
        bindNewChatButton();
        bindHeroButtons();
        bindQuickActions();
        bindChatControls();
    
        bindTasks();

        await loadMessages();

        loadSharedFiles();

        renderUpcomingMeetings();

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }


    /* ==========================================================
       LOAD MESSAGES FROM POSTGRESQL
    ========================================================== */

    async function loadMessages() {

        try {

            console.log("GET MESSAGES:", API_URL);

            const response =
                await fetch(API_URL);

            const data =
                await response.json();

            console.log(
                "GET MESSAGES RESPONSE:",
                data
            );

            if (!response.ok || !data.success) {

                throw new Error(
                    data.message ||
                    `HTTP ${response.status}`
                );

            }

            messages =
                Array.isArray(data.messages)
                    ? data.messages
                    : [];

            renderMessages(messages);

            updateCounters();

        } catch (error) {

            console.error(
                "LOAD MESSAGES ERROR:",
                error
            );

            renderMessages([]);

        }

    }

    /* ==========================================================
   LOAD SHARED FILES
========================================================== */

async function loadSharedFiles() {

    const container =
        document.getElementById("sharedFilesList");

    if (!container) {
        console.warn("Shared files container not found.");
        return;
    }

    try {

        console.log("GET SHARED FILES");

        const response = await fetch(
            "https://icm-website-test-production.up.railway.app/api/upload"
        );

        const data = await response.json();

        console.log(
            "GET SHARED FILES RESPONSE:",
            data
        );

        if (!response.ok || !data.success) {
            throw new Error(
                data.message ||
                `HTTP ${response.status}`
            );
        }

        const files =
            Array.isArray(data.files)
                ? data.files
                : [];

        if (!files.length) {

            container.innerHTML = `
                <div class="shared-files-empty">
                    No shared files yet.
                </div>
            `;

            return;
        }

        container.innerHTML = files
            .map(file => {

                const fileName =
                    file.name ||
                    "Unnamed file";

                const extension =
                    fileName
                        .split(".")
                        .pop()
                        .toLowerCase();

                let icon = "fa-file";

                if (extension === "pdf") {

                    icon = "fa-file-pdf";

                } else if (
                    ["xlsx", "xls", "csv"]
                        .includes(extension)
                ) {

                    icon = "fa-file-excel";

                } else if (
                    ["doc", "docx"]
                        .includes(extension)
                ) {

                    icon = "fa-file-word";

                } else if (
                    ["ppt", "pptx"]
                        .includes(extension)
                ) {

                    icon = "fa-file-powerpoint";

                } else if (
                    ["jpg", "jpeg", "png", "gif", "webp"]
                        .includes(extension)
                ) {

                    icon = "fa-file-image";
                }

                return `
                    <div class="shared-file">

                        <!-- FILE INFORMATION -->

                        <a
                            href="${file.url}"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="shared-file-link"
                        >

                            <i
                                class="fa-solid ${icon}"
                            ></i>

                            <div class="shared-file-info">

                                <h5>
                                    ${escapeHtml(fileName)}
                                </h5>

                                <small>
                                    ${formatFileSize(file.size)}
                                </small>

                            </div>

                        </a>


                        <!-- FILE ACTIONS -->

                        <div class="shared-file-actions">

                            <button
                                type="button"
                                class="shared-file-edit"
                                data-public-id="${escapeHtml(file.public_id)}"
                                data-resource-type="${escapeHtml(file.resource_type || "image")}"
                                data-file-name="${escapeHtml(fileName)}"
                                title="Edit file name"
                            >
                                <i class="fa-solid fa-pen"></i>
                            </button>


                            <button
                                type="button"
                                class="shared-file-delete"
                                data-public-id="${escapeHtml(file.public_id)}"
                                data-resource-type="${escapeHtml(file.resource_type || "image")}"
                                title="Delete file"
                            >
                                <i class="fa-solid fa-trash"></i>
                            </button>

                        </div>

                    </div>
                `;

            })
            .join("");


        /* ==================================================
           EDIT FILE
        ================================================== */

        container
            .querySelectorAll(".shared-file-edit")
            .forEach(button => {

                button.addEventListener("click", async function () {

                    const publicId =
                        this.dataset.publicId;

                    const resourceType =
                        this.dataset.resourceType ||
                        "image";

                    const currentName =
                        this.dataset.fileName ||
                        "";

                    const newName =
                        prompt(
                            "Enter the new file name:",
                            currentName
                        );

                    if (
                        newName === null ||
                        !newName.trim()
                    ) {
                        return;
                    }

                    try {

                           const response =
                          await fetch(
                            "https://icm-website-test-production.up.railway.app/api/upload",
                             {
                                method: "PUT",

                             headers: {
                           "Content-Type": "application/json"
                               },

                       body: JSON.stringify({
                                 public_id: publicId,
                           name: newName.trim(),
                                 resource_type: resourceType
                                })
                                 }
                             );

                        const data =
                            await response.json();

                        if (
                            !response.ok ||
                            !data.success
                        ) {

                            throw new Error(
                                data.message ||
                                "Failed to rename file"
                            );
                        }

                        alert(
                            "File renamed successfully."
                        );

                        await loadSharedFiles();

                    } catch (error) {

                        console.error(
                            "EDIT FILE ERROR:",
                            error
                        );

                        alert(
                            error.message ||
                            "Unable to rename file."
                        );
                    }

                });

            });


        /* ==================================================
           DELETE FILE
        ================================================== */

        container
            .querySelectorAll(".shared-file-delete")
            .forEach(button => {

                button.addEventListener("click", async function () {

                    const publicId =
                        this.dataset.publicId;

                    const resourceType =
                        this.dataset.resourceType ||
                        "image";

                    const confirmed =
                        confirm(
                            "Are you sure you want to delete this file?"
                        );

                    if (!confirmed) {
                        return;
                    }

                    try {

                          const response =
                        await fetch(
                           `https://icm-website-test-production.up.railway.app/api/upload?public_id=${encodeURIComponent(publicId)}&resource_type=${encodeURIComponent(resourceType)}`,
       
                        {
                            method: "DELETE"
                           }
                         );

                        const data =
                            await response.json();

                        if (
                            !response.ok ||
                            !data.success
                        ) {

                            throw new Error(
                                data.message ||
                                "Failed to delete file"
                            );
                        }

                        alert(
                            "File deleted successfully."
                        );

                        await loadSharedFiles();

                    } catch (error) {

                        console.error(
                            "DELETE FILE ERROR:",
                            error
                        );

                        alert(
                            error.message ||
                            "Unable to delete file."
                        );
                    }

                });

            });

    } catch (error) {

        console.error(
            "LOAD SHARED FILES ERROR:",
            error
        );

        container.innerHTML = `
            <div class="shared-files-empty">
                Unable to load files.
            </div>
        `;
    }
}


/* ==========================================================
   UPLOAD SHARED FILE
========================================================== */

const uploadSharedFileBtn =
    document.getElementById(
        "uploadSharedFileBtn"
    );

const sharedFileInput =
    document.getElementById(
        "sharedFileInput"
    );


if (
    uploadSharedFileBtn &&
    sharedFileInput
) {

    uploadSharedFileBtn.addEventListener(
        "click",
        () => {

            sharedFileInput.click();

        }
    );


    sharedFileInput.addEventListener(
        "change",
        async function () {

            const file =
                this.files[0];

            if (!file) {
                return;
            }

            try {

                uploadSharedFileBtn.disabled =
                    true;

                uploadSharedFileBtn.innerHTML = `
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Uploading...
                `;


                const formData =
                    new FormData();

                formData.append(
                    "file",
                    file
                );


                const response =
                    await fetch(
                        "https://icm-website-test-production.up.railway.app/api/upload",
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Upload failed"
                    );

                }


                alert(
                    "File uploaded successfully."
                );


                this.value = "";


                await loadSharedFiles();


            } catch (error) {

                console.error(
                    "UPLOAD FILE ERROR:",
                    error
                );

                alert(
                    error.message ||
                    "Unable to upload file."
                );

            } finally {

                uploadSharedFileBtn.disabled =
                    false;

                uploadSharedFileBtn.innerHTML = `
                    <i class="fa-solid fa-cloud-arrow-up"></i>
                    Upload
                `;

            }

        }
    );

}

/* ==========================================================
   SHARED FILE ACTIONS
========================================================== */

function bindSharedFileActions() {


    document
        .querySelectorAll(".shared-file-edit")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();


                    editSharedFile(
                        button.dataset.publicId,
                        button.dataset.resourceType,
                        button.dataset.fileName
                    );

                }
            );

        });


    document
        .querySelectorAll(".shared-file-delete")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.preventDefault();
                    event.stopPropagation();


                    deleteSharedFile(
                        button.dataset.publicId,
                        button.dataset.resourceType,
                        button.dataset.fileName
                    );

                }
            );

        });

}


/* ==========================================================
   EDIT / RENAME SHARED FILE
========================================================== */

function editSharedFile(
    publicId,
    resourceType,
    currentName
) {

    openModal(

        "Rename Shared File",

        `

        <label
            style="
                display:block;
                margin-bottom:8px;
                font-weight:600;
            "
        >
            File name
        </label>


        <input
            id="editSharedFileName"
            type="text"
            value="${escapeHtml(currentName)}"
            style="
                width:100%;
                padding:12px;
                box-sizing:border-box;
                border:1px solid #ddd;
                border-radius:10px;
            "
        >

        `,

        async modal => {

            const input =
                modal.querySelector(
                    "#editSharedFileName"
                );


            const newName =
                input?.value.trim();


            if (!newName) {

                showToast(
                    "Please enter a file name.",
                    "error"
                );

                return;

            }


            try {

                const response =
                    await fetch(

                        `https://icm-website-test-production.up.railway.app/api/upload/${encodeURIComponent(publicId)}`,

                        {
                            method: "PUT",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({

                                    name:
                                        newName,

                                    resource_type:
                                        resourceType

                                })

                        }

                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Rename failed"
                    );

                }


                modal.close();


                showToast(
                    "File renamed successfully."
                );


                await loadSharedFiles();


            } catch (error) {

                console.error(
                    "RENAME FILE ERROR:",
                    error
                );


                showToast(
                    "Unable to rename file: " +
                    error.message,
                    "error"
                );

            }

        },

        "Rename"

    );

}


/* ==========================================================
   DELETE SHARED FILE
========================================================== */

async function deleteSharedFile(
    publicId,
    resourceType,
    fileName
) {

    const confirmed =
        confirm(
            `Delete "${fileName}"?\n\nThis cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    try {

        showToast(
            "Deleting file..."
        );


        const response =
            await fetch(

                `https://icm-website-test-production.up.railway.app/api/upload/${encodeURIComponent(publicId)}?resource_type=${encodeURIComponent(resourceType)}`,

                {
                    method: "DELETE"
                }

            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Delete failed"
            );

        }


        showToast(
            "File deleted successfully."
        );


        await loadSharedFiles();


    } catch (error) {

        console.error(
            "DELETE FILE ERROR:",
            error
        );


        showToast(
            "Unable to delete file: " +
            error.message,
            "error"
        );

    }

}


    /* ==========================================================
       SEND MESSAGE TO POSTGRESQL
    ========================================================== */

    async function sendMessage(
        text,
        type = "text"
    ) {

        const value =
            String(text || "").trim();

        if (!value) {
            return false;
        }

        try {

            console.log(
                "SENDING MESSAGE:",
                value
            );

            const response =
                await fetch(API_URL, {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        senderId: null,

                        senderName:
                            "Claire",

                        senderRole:
                            "staff",
                            

                        recipientId: null,

                        conversationId:
                            currentConversation,

                        messageText:
                            value,

                        messageType:
                            type

                    })

                });


            const data =
                await response.json();


            console.log(
                "POST MESSAGES RESPONSE:",
                data
            );


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    `HTTP ${response.status}`
                );

            }


            const input =
                document.querySelector(
                    ".chat-input input"
                );

            if (input) {
                input.value = "";
            }


            await loadMessages();

            return true;


        } catch (error) {

            console.error(
                "SEND MESSAGE ERROR:",
                error
            );

            showToast(
                "Unable to send message: " +
                error.message,
                "error"
            );

            return false;

        }

    }


    /* ==========================================================
       RENDER DATABASE MESSAGES
    ========================================================== */

    function renderMessages(list) {

        const container =
            document.querySelector(
                ".chat-panel .chat-messages"
            );


        if (!container) {

            console.error(
                "CHAT MESSAGES CONTAINER NOT FOUND"
            );

            return;

        }


        container.innerHTML = "";


        if (!list.length) {

            container.innerHTML = `

                <div
                    class="no-messages"
                    style="
                        text-align:center;
                        padding:40px;
                        color:#888;
                    "
                >

                    No messages yet.

                </div>

            `;

            return;

        }


        /*
            Database returns newest first.
            Reverse so oldest appears first.
        */

        [
            ...list
        ]
        .reverse()
        .forEach(message => {

            const row =
                document.createElement(
                    "div"
                );


            const own =
                message.sender_name ===
                "Claire";


            row.className =
                `message-row ${
                    own
                        ? "sent"
                        : "received"
                }`;


            const avatar =
                own
                    ? ""
                    : `

                        <div
                            class="
                                message-avatar
                                initials-avatar
                            "
                        >
                            ${
                                escapeHtml(
                                    getInitials(
                                        message.sender_name
                                    )
                                )
                            }
                        </div>

                    `;


            row.innerHTML = `

                ${avatar}


                <div
                    class="message-content"
                >

                    ${
                        own
                            ? ""
                            : `

                                <div
                                    class="message-name"
                                >

                                    ${
                                        escapeHtml(
                                            message.sender_name ||
                                            "Unknown"
                                        )
                                    }

                                    <span>

                                        ${
                                            escapeHtml(
                                                message.sender_role ||
                                                ""
                                            )
                                        }

                                    </span>

                                </div>

                            `
                    }


                    <div
                        class="
                            message-bubble
                            ${
                                message.message_type ===
                                "announcement"
                                    ? "announcement-bubble"
                                    : ""
                            }
                        "
                    >

                        ${
                            message.message_type ===
                            "announcement"

                                ? `
                                    <strong>
                                        📢 Announcement
                                    </strong>
                                    <br>
                                  `

                                : ""
                        }


                        ${
                            escapeHtml(
                                message.message_text ||
                                ""
                            )
                        }

                    </div>


                    <div
                        class="message-time"
                    >

                        ${
                            formatTime(
                                message.created_at
                            )
                        }

                        ${
                            own
                                ? " ✓✓"
                                : ""
                        }

                    </div>

                </div>

            `;


            container.appendChild(row);

        });


        container.scrollTop =
            container.scrollHeight;

    }


/* ==========================================================
   PART 2: CHAT INPUT + CONVERSATION CONTROLS
========================================================== */


/* ==========================================================
   CHAT INPUT
========================================================== */

function bindMessageInput() {

    const input =
        document.querySelector(
            ".chat-input input"
        );

    const send =
        document.querySelector(
            ".chat-input .send-message"
        );


    if (send) {

        send.addEventListener(
            "click",
            async event => {

                event.preventDefault();

                await sendMessage(
                    input?.value
                );

            }
        );

    }


    if (input) {

        input.addEventListener(
            "keydown",
            async event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    await sendMessage(
                        input.value
                    );

                }

            }
        );

    }

}


/* ==========================================================
   CONVERSATION SEARCH
========================================================== */

function bindConversationSearch() {

    const input =
        document.querySelector(
            ".conversation-search input"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        () => {

            const query =
                input.value
                    .toLowerCase()
                    .trim();


            document
                .querySelectorAll(
                    ".conversation-item"
                )
                .forEach(item => {

                    const content =
                        item.textContent
                            .toLowerCase();


                    item.style.display =
                        !query ||
                        content.includes(query)
                            ? ""
                            : "none";

                });

        }
    );

}


/* ==========================================================
   ALL / UNREAD / PINNED
========================================================== */

function bindConversationTabs() {

    document
        .querySelectorAll(
            ".department-tabs button"
        )
        .forEach(tab => {

            tab.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".department-tabs button"
                        )
                        .forEach(button => {

                            button.classList.remove(
                                "active"
                            );

                        });


                    tab.classList.add(
                        "active"
                    );


                    currentFilter =
                        tab.textContent
                            .trim()
                            .toLowerCase();


                    filterConversations();

                }
            );

        });

}


/* ==========================================================
   FILTER CONVERSATIONS
========================================================== */

function filterConversations() {

    document
        .querySelectorAll(
            ".conversation-item"
        )
        .forEach(item => {

            let visible = true;


            if (
                currentFilter ===
                "unread"
            ) {

                visible =
                    !!item.querySelector(
                        ".unread-count"
                    );

            }


            if (
                currentFilter ===
                "pinned"
            ) {

                visible =
                    item.classList.contains(
                        "pinned"
                    );

            }


            item.style.display =
                visible
                    ? ""
                    : "none";

        });

}


/* ==========================================================
   CONVERSATION SELECTION
========================================================== */

function bindConversationItems() {

    document
        .querySelectorAll(
            ".conversation-item"
        )
        .forEach(item => {

            item.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".conversation-item"
                        )
                        .forEach(
                            conversation => {

                                conversation
                                    .classList
                                    .remove(
                                        "active"
                                    );

                            }
                        );


                    item.classList.add(
                        "active"
                    );


                    const name =
                        item
                            .querySelector("h4")
                            ?.textContent
                            .trim();


                    if (name) {

                        const heading =
                            document.querySelector(
                                ".chat-user h3"
                            );


                        if (heading) {

                            heading.textContent =
                                name;

                        }

                    }


                    /*
                       Remove unread badge after
                       opening the conversation.
                    */

                    const unread =
                        item.querySelector(
                            ".unread-count"
                        );


                    if (unread) {
                        unread.remove();
                    }


                    const input =
                        document.querySelector(
                            ".chat-input input"
                        );


                    if (input) {
                        input.focus();
                    }

                }
            );

        });

}


/* ==========================================================
   NEW CHAT BUTTON
========================================================== */

function bindNewChatButton() {

    const button =
        document.querySelector(
            ".new-chat-btn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            openMessageComposer();

        }
    );

}

/* ==========================================================
   PART 3: HERO BUTTONS + QUICK ACTIONS
========================================================== */


/* ==========================================================
   HERO BUTTONS
========================================================== */

function bindHeroButtons() {

    const buttons =
        document.querySelectorAll(
            ".hero-actions .hero-btn"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const text =
                    button.textContent
                        .trim()
                        .replace(/\s+/g, " ");


                if (
                    text.includes(
                        "New Message"
                    )
                ) {

                    openMessageComposer();

                    return;

                }


                if (
                    text.includes(
                        "Announcement"
                    )
                ) {

                    openAnnouncementComposer();

                    return;

                }


                if (
                    text.includes(
                        "Create Group"
                    )
                ) {

                    openGroupComposer();

                    return;

                }

            }
        );

    });

}


/* ==========================================================
   QUICK ACTIONS
========================================================== */

function bindQuickActions() {

    document
        .querySelectorAll(
            ".action-card"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    const text =
                        card.textContent
                            .trim()
                            .replace(/\s+/g, " ");


                    if (
                        text.includes(
                            "New Message"
                        )
                    ) {

                        openMessageComposer();

                        return;

                    }


                    if (
                        text.includes(
                            "Create Group"
                        )
                    ) {

                        openGroupComposer();

                        return;

                    }


                    if (
                        text.includes(
                            "Announcement"
                        )
                    ) {

                        openAnnouncementComposer();

                        return;

                    }


                    if (
                        text.includes(
                            "Meeting"
                        )
                    ) {

                        openMeetingComposer();

                        return;

                    }


                    if (
                        text.includes(
                            "Upload File"
                        )
                    ) {

                        chooseFile();

                        return;

                    }


                    if (
                        text.includes(
                            "Reports"
                        )
                    ) {

                        showReports();

                        return;

                    }

                }
            );

        });

}


/* ==========================================================
   NEW MESSAGE COMPOSER
========================================================== */

function openMessageComposer() {

    openModal(
        "New Message",

        `

        <textarea
            id="newMessageText"
            placeholder="Type your message..."
            style="
                width:100%;
                min-height:140px;
                padding:12px;
                box-sizing:border-box;
                border:1px solid #ddd;
                border-radius:10px;
                resize:vertical;
                font-family:inherit;
            "
        ></textarea>

        `,

        async modal => {

            const textarea =
                modal.querySelector(
                    "#newMessageText"
                );


            const text =
                textarea?.value.trim();


            if (!text) {

                showToast(
                    "Please enter a message.",
                    "error"
                );

                return;

            }


            const success =
                await sendMessage(
                    text,
                    "text"
                );


            if (success) {

                modal.close();

            }

        },

        "Send Message"

    );

}


/* ==========================================================
   ANNOUNCEMENT COMPOSER
========================================================== */

function openAnnouncementComposer() {

    openModal(
        "New Announcement",

        `

        <textarea
            id="announcementText"
            placeholder="Write your announcement..."
            style="
                width:100%;
                min-height:160px;
                padding:12px;
                box-sizing:border-box;
                border:1px solid #ddd;
                border-radius:10px;
                resize:vertical;
                font-family:inherit;
            "
        ></textarea>

        `,

        async modal => {

            const textarea =
                modal.querySelector(
                    "#announcementText"
                );


            const text =
                textarea?.value.trim();


            if (!text) {

                showToast(
                    "Please enter an announcement.",
                    "error"
                );

                return;

            }


            const success =
                await sendMessage(
                    text,
                    "announcement"
                );


            if (success) {

                modal.close();

                showToast(
                    "Announcement published."
                );

            }

        },

        "Publish"

    );

}


/* ==========================================================
   CREATE GROUP
========================================================== */

function openGroupComposer() {

    openModal(
        "Create Group",

        `

        <input
            id="groupName"
            type="text"
            placeholder="Group name"
            style="
                width:100%;
                padding:12px;
                box-sizing:border-box;
                margin-bottom:12px;
                border:1px solid #ddd;
                border-radius:10px;
            "
        >

        <input
            id="groupMembers"
            type="text"
            placeholder="Members, separated by commas"
            style="
                width:100%;
                padding:12px;
                box-sizing:border-box;
                border:1px solid #ddd;
                border-radius:10px;
            "
        >

        `,

        modal => {

            const name =
                modal.querySelector(
                    "#groupName"
                )?.value.trim();


            const members =
                modal.querySelector(
                    "#groupMembers"
                )?.value.trim();


            if (!name) {

                showToast(
                    "Please enter a group name.",
                    "error"
                );

                return;

            }


            const groups =
                JSON.parse(
                    localStorage.getItem(
                        "staff-lms-groups"
                    ) || "[]"
                );


            groups.unshift({

                id: Date.now(),

                name: name,

                members:
                    members
                        ? members
                            .split(",")
                            .map(
                                member =>
                                    member.trim()
                            )
                            .filter(Boolean)
                        : [],

                createdAt:
                    new Date().toISOString()

            });


            localStorage.setItem(
                "staff-lms-groups",
                JSON.stringify(groups)
            );


            modal.close();


            showToast(
                `Group "${name}" created successfully.`
            );

        },

        "Create Group"

    );

}

/* ==========================================================
   PART 4: CHAT HEADER + ATTACHMENTS + EMOJI
========================================================== */


/* ==========================================================
   CHAT HEADER BUTTONS
========================================================== */

function bindChatControls() {

    const chatButtons =
        document.querySelectorAll(".chat-icons button");

    console.log(
        "CHAT HEADER BUTTONS FOUND:",
        chatButtons.length
    );

    if (chatButtons.length >= 1) {

        chatButtons[0].addEventListener("click", function (event) {

            event.preventDefault();
            event.stopPropagation();

            console.log("AUDIO BUTTON CLICKED");

            startCall("voice");

        });

    }


    if (chatButtons.length >= 2) {

        chatButtons[1].addEventListener("click", function (event) {

            event.preventDefault();
            event.stopPropagation();

            console.log("VIDEO BUTTON CLICKED");

            startCall("video");

        });

    }


    if (chatButtons.length >= 3) {

        chatButtons[2].addEventListener("click", function (event) {

            event.preventDefault();
            event.stopPropagation();

            console.log("CALENDAR BUTTON CLICKED");

            openMeetingComposer();

        });

    }


    if (chatButtons.length >= 4) {

        chatButtons[3].addEventListener("click", function (event) {

            event.preventDefault();
            event.stopPropagation();

            console.log("MENU BUTTON CLICKED");

            openConversationMenu(chatButtons[3]);

        });

    }


    /* CHAT INPUT BUTTONS */

    const chatInput =
        document.querySelector(".chat-input");

    if (!chatInput) return;

    const buttons =
        chatInput.querySelectorAll("button");


    if (buttons[0]) {

        buttons[0].addEventListener("click", function(event) {

            event.preventDefault();

            chooseFile();

        });

    }


    if (buttons[1]) {

        buttons[1].addEventListener("click", function(event) {

            event.preventDefault();

            insertEmoji();

        });

    }


    if (buttons[2]) {

        buttons[2].addEventListener("click", function(event) {

            event.preventDefault();

            chooseImage();

        });

    }

}

window.startCall = function(type) {

    const callType =
        type === "video"
            ? "Video Call"
            : "Audio Call";

    const member =
        document.querySelector(".chat-user h3")?.textContent?.trim()
        || "Current member";


    const today = new Date();

    const defaultDate =
        today.toISOString().slice(0, 10);


    const modalHtml = `
        <div style="padding:10px">

            <p style="margin-top:0">
                Schedule a
                <strong>${callType}</strong>
                with
                <strong>${escapeHtml(member)}</strong>
            </p>

            <label>
                Date
            </label>

            <input
                id="callDate"
                type="date"
                value="${defaultDate}"
                style="
                    width:100%;
                    padding:10px;
                    margin:6px 0 15px;
                    box-sizing:border-box;
                "
            >

            <label>
                Time
            </label>

            <input
                id="callTime"
                type="time"
                style="
                    width:100%;
                    padding:10px;
                    margin:6px 0;
                    box-sizing:border-box;
                "
            >

        </div>
    `;


    if (typeof openModal !== "function") {

        alert(
            `${callType} with ${member}\n\n` +
            "The call scheduler is not available."
        );

        return;
    }


    openModal(
        `Schedule ${callType}`,
        modalHtml,

        function(modal) {

           const selectedDate =
    document.querySelector("#callDate")?.value;

const selectedTime =
    document.querySelector("#callTime")?.value;


            if (!selectedDate || !selectedTime) {

                alert(
                    "Please select a date and time."
                );

                return;
            }


            const storageKey =
                "staff-lms-scheduled-calls";


            let calls = [];

            try {

                calls =
                    JSON.parse(
                        localStorage.getItem(storageKey)
                        || "[]"
                    );

            } catch (error) {

                calls = [];

            }


            const call = {

                id: Date.now(),

                type:
                    type === "video"
                        ? "video"
                        : "voice",

                callType:

                    callType,

                member:

                    member,

                conversationId:

                    typeof currentConversation !== "undefined"
                        ? currentConversation
                        : "staff-general",

                date:

                    selectedDate,

                time:

                    selectedTime,

                status:

                    "scheduled",

                createdAt:

                    new Date().toISOString()

            };


            calls.unshift(call);


            localStorage.setItem(
                storageKey,
                JSON.stringify(calls)
            );


            if (
                modal &&
                typeof modal.close === "function"
            ) {

                modal.close();

            }


            alert(
                `${callType} scheduled successfully!\n\n` +
                `Member: ${member}\n` +
                `Date: ${selectedDate}\n` +
                `Time: ${selectedTime}`
            );


            console.log(
                "CALL SCHEDULED:",
                call
            );

        },

        "Schedule Call"
    );

};

    // IMAGE
  const buttons = document.querySelectorAll(".chat-header-actions button");

if (buttons.length >= 3) {
    buttons[2].addEventListener("click", () => {
        console.log("More menu clicked");
    });
}




/* ==========================================================
   FILE ATTACHMENT
========================================================== */

/* ==========================================================
   FILE UPLOAD
========================================================== */

async function chooseFile() {

    const input =
        document.createElement("input");

    input.type = "file";


    input.onchange = async () => {

        const file =
            input.files?.[0];

        if (!file) {
            return;
        }


        const formData =
            new FormData();

        formData.append(
            "file",
            file
        );


        showToast(
            `Uploading ${file.name}...`
        );


        try {

            const response =
                await fetch(
                    "https://icm-website-test-production.up.railway.app/api/upload",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            const data =
                await response.json();


            console.log(
                "UPLOAD RESPONSE:",
                data
            );


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Upload failed"
                );

            }


            showToast(
                "File uploaded successfully."
            );


            await loadSharedFiles();


        } catch (error) {

            console.error(
                "UPLOAD FILE ERROR:",
                error
            );


            showToast(
                "Upload failed: " +
                error.message,
                "error"
            );

        }

    };


    input.click();

}


/* ==========================================================
   IMAGE ATTACHMENT
========================================================== */

function chooseImage() {

    const input =
        document.createElement(
            "input"
        );


    input.type =
        "file";


    input.accept =
        "image/*";


    input.onchange = () => {

        const file =
            input.files?.[0];


        if (!file) {
            return;
        }


        showToast(
            `Selected image: ${file.name}`
        );


        console.log(
            "Selected image:",
            file
        );

    };


    input.click();

}


/* ==========================================================
   EMOJI
========================================================== */

function insertEmoji() {

    const input =
        document.querySelector(
            ".chat-input input"
        );


    if (!input) {
        return;
    }


    const emoji =
        prompt(
            "Enter an emoji:\n\n" +
            "😀 😂 😍 👍 ❤️ 👏 🎉 🔥 " +
            "✅ 😊 📢 📅"
        );


    if (!emoji) {
        return;
    }


    input.value +=
        emoji;



}


/* ==========================================================
   CONVERSATION THREE-DOT MENU
========================================================== */

function openConversationMenu(button) {

    /*
       Remove an existing menu first.
    */

    const existing =
        document.getElementById(
            "conversationActionMenu"
        );


    if (existing) {
        existing.remove();
    }


    const menu =
        document.createElement(
            "div"
        );


    menu.id =
        "conversationActionMenu";


    menu.style.cssText = `

        position:fixed;

        z-index:99999;

        background:#ffffff;

        border:1px solid #ddd;

        border-radius:10px;

        box-shadow:
            0 10px 30px
            rgba(0,0,0,.18);

        padding:6px;

        min-width:200px;

    `;


    const rect =
        button.getBoundingClientRect();


    menu.style.top =
        `${rect.bottom + 6}px`;


    menu.style.left =
        `${Math.max(
            10,
            rect.left - 160
        )}px`;


    const options = [

        "Mute conversation",

        "Mark as unread",

        "Pin conversation",

        "Refresh messages"

    ];


    options.forEach(
        optionText => {

            const option =
                document.createElement(
                    "button"
                );


            option.type =
                "button";


            option.textContent =
                optionText;


            option.style.cssText = `

                display:block;

                width:100%;

                padding:10px 12px;

                border:none;

                background:#fff;

                text-align:left;

                cursor:pointer;

                border-radius:6px;

            `;


            option.addEventListener(
                "mouseenter",
                () => {

                    option.style.background =
                        "#f3f5f8";

                }
            );


            option.addEventListener(
                "mouseleave",
                () => {

                    option.style.background =
                        "#fff";

                }
            );


            option.addEventListener(
                "click",
                async () => {

                    if (
                        optionText ===
                        "Refresh messages"
                    ) {

                        await loadMessages();

                    }

                    else if (
                        optionText ===
                        "Mute conversation"
                    ) {

                        localStorage.setItem(
                            "staff-lms-muted",
                            "true"
                        );

                        showToast(
                            "Conversation muted."
                        );

                    }

                    else if (
                        optionText ===
                        "Mark as unread"
                    ) {

                        showToast(
                            "Conversation marked as unread."
                        );

                    }

                    else if (
                        optionText ===
                        "Pin conversation"
                    ) {

                        const active =
                            document.querySelector(
                                ".conversation-item.active"
                            );


                        if (active) {

                            active.classList.toggle(
                                "pinned"
                            );

                        }

                        showToast(
                            "Conversation pin updated."
                        );

                    }


                    menu.remove();

                }
            );


            menu.appendChild(
                option
            );

        }
    );


    document.body.appendChild(
        menu
    );


    /*
       Close menu when clicking outside.
    */

    setTimeout(
        () => {

            function closeMenu(event) {

                if (
                    !menu.contains(
                        event.target
                    ) &&
                    event.target !== button
                ) {

                    menu.remove();

                    document.removeEventListener(
                        "click",
                        closeMenu
                    );

                }

            }


            document.addEventListener(
                "click",
                closeMenu
            );

        },
        0
    );

}

/* ==========================================================
   PART 5: RIGHT PANEL + MODALS + HELPERS
========================================================== */


/* ==========================================================
   RIGHT PANEL
========================================================== */

function bindTasks() {

    document
        .querySelectorAll(
            ".task-list input[type='checkbox']"
        )
        .forEach(
            (checkbox, index) => {

                const key =
                    `staff-lms-task-${index}`;


                const saved =
                    localStorage.getItem(
                        key
                    );


                if (saved !== null) {

                    checkbox.checked =
                        saved === "true";

                }


                checkbox.addEventListener(
                    "change",
                    () => {

                        localStorage.setItem(
                            key,
                            String(
                                checkbox.checked
                            )
                        );

                    }
                );

            }
        );

}


/* ==========================================================
   TEAM SETTINGS
========================================================== */

function openTeamSettings() {

    openModal(

        "Operations Team Settings",

        `

        <label
            style="
                display:block;
                margin:14px 0;
            "
        >

            <input
                id="settingNotifications"
                type="checkbox"
                checked
            >

            Notifications enabled

        </label>


        <label
            style="
                display:block;
                margin:14px 0;
            "
        >

            <input
                id="settingOnline"
                type="checkbox"
                checked
            >

            Show online status

        </label>


        <label
            style="
                display:block;
                margin:14px 0;
            "
        >

            <input
                id="settingMute"
                type="checkbox"
            >

            Mute conversation

        </label>

        `,

        modal => {

            const settings = {

                notifications:
                    modal.querySelector(
                        "#settingNotifications"
                    )?.checked || false,

                online:
                    modal.querySelector(
                        "#settingOnline"
                    )?.checked || false,

                mute:
                    modal.querySelector(
                        "#settingMute"
                    )?.checked || false

            };


            localStorage.setItem(

                "staff-lms-team-settings",

                JSON.stringify(
                    settings
                )

            );


            modal.close();


            showToast(
                "Team settings saved."
            );

        },

        "Save Settings"

    );

}


/* ==========================================================
   UPCOMING MEETINGS - MESSAGES PAGE
========================================================== */

function renderUpcomingMeetings() {

    const container =
        document.getElementById(
            "upcomingMeetingsList"
        );

    if (!container) {
        console.warn(
            "Upcoming meetings container not found."
        );
        return;
    }

    let meetings = [];

    try {

        meetings = JSON.parse(
            localStorage.getItem(
                "staff-lms-meetings"
            ) || "[]"
        );

    } catch (error) {

        console.error(
            "Unable to read meetings:",
            error
        );

        meetings = [];
    }

    if (!Array.isArray(meetings)) {
        meetings = [];
    }


    /* ------------------------------------------
       REMOVE COMPLETED MEETINGS
    ------------------------------------------ */

    const now = new Date();

    meetings = meetings.filter(meeting => {

        if (!meeting.date || !meeting.time) {
            return false;
        }

        const meetingDateTime =
            new Date(
                `${meeting.date}T${meeting.time}`
            );

        return meetingDateTime >= now;
    });


    /* ------------------------------------------
       SORT EARLIEST FIRST
    ------------------------------------------ */

    meetings.sort((a, b) => {

        const dateA =
            new Date(
                `${a.date}T${a.time}`
            );

        const dateB =
            new Date(
                `${b.date}T${b.time}`
            );

        return dateA - dateB;
    });


    /* ------------------------------------------
       NO MEETINGS
    ------------------------------------------ */

    if (!meetings.length) {

        container.innerHTML = `
            <div class="meeting-box">

                <h4>No upcoming meetings</h4>

                <span>
                    Schedule a meeting to see it here.
                </span>

            </div>
        `;

        return;
    }


    /* ------------------------------------------
       DISPLAY MEETINGS
    ------------------------------------------ */

    container.innerHTML = meetings
        .map(meeting => {

            const meetingDate =
                new Date(
                    `${meeting.date}T${meeting.time}`
                );

            const today =
                new Date();

            const tomorrow =
                new Date();

            tomorrow.setDate(
                today.getDate() + 1
            );


            let dateLabel;

            if (
                meetingDate.toDateString() ===
                today.toDateString()
            ) {

                dateLabel = "Today";

            } else if (
                meetingDate.toDateString() ===
                tomorrow.toDateString()
            ) {

                dateLabel = "Tomorrow";

            } else {

                dateLabel =
                    meetingDate.toLocaleDateString(
                        "en-GB",
                        {
                            day: "2-digit",
                            month: "short",
                            year: "numeric"
                        }
                    );
            }


            const formattedTime =
                meetingDate.toLocaleTimeString(
                    [],
                    {
                        hour: "numeric",
                        minute: "2-digit"
                    }
                );


            return `
                <div
                    class="meeting-box"
                    data-meeting-id="${meeting.id}"
                >

                    <h4>
                        ${escapeHtml(
                            meeting.title ||
                            "Untitled Meeting"
                        )}
                    </h4>

                    <span>
                        ${dateLabel}
                        •
                        ${formattedTime}
                    </span>

                    <button
                        type="button"
                        onclick="
                            window.location.href =
                            'meeting-room.html?id=${meeting.id}'
                        "
                    >
                        Join
                    </button>

                </div>
            `;

        })
        .join("");


    console.log(
        "UPCOMING MEETINGS RENDERED:",
        meetings
    );
}


/* ==========================================================
   MEETING
========================================================== */

function openMeetingComposer() {

    openModal(
        "Schedule Meeting",
        `
        <input
            id="meetingTitle"
            type="text"
            placeholder="Meeting title"
            style="
                width:100%;
                padding:12px;
                box-sizing:border-box;
                margin-bottom:12px;
                border:1px solid #ddd;
                border-radius:10px;
            "
        >

        <input
            id="meetingDate"
            type="date"
            style="
                width:100%;
                padding:12px;
                box-sizing:border-box;
                margin-bottom:12px;
                border:1px solid #ddd;
                border-radius:10px;
            "
        >

        <input
            id="meetingTime"
            type="time"
            style="
                width:100%;
                padding:12px;
                box-sizing:border-box;
                border:1px solid #ddd;
                border-radius:10px;
            "
        >
        `,
        modal => {

           const title =
    document.querySelector("#meetingTitle")?.value.trim();

const date =
    document.querySelector("#meetingDate")?.value;

const time =
    document.querySelector("#meetingTime")?.value;

            if (
                !title ||
                !date ||
                !time
            ) {
                showToast(
                    "Complete all meeting fields.",
                    "error"
                );
                return;
            }

            const meetings =
                JSON.parse(
                    localStorage.getItem(
                        "staff-lms-meetings"
                    ) || "[]"
                );

            const meeting = {

                id:
                    Date.now(),

                title:
                    title,

                tutor:
                    "Claire",

                date:
                    date,

                time:
                    time,

                duration:
                    60,

                provider:
                    "meet",

                platform:
                    "Google Meet",

                badge:
                    "meet",

                status:
                    "UPCOMING",

                attendees:
                    0,

                meetingId:
                    "",

                meetingPassword:
                    "",

                join:
                    "#",

                description:
                    "",

                createdAt:
                    new Date()
                        .toISOString()
            };

            meetings.unshift(meeting);

            localStorage.setItem(
                "staff-lms-meetings",
                JSON.stringify(meetings)
            );

            document.querySelector(".modal-overlay")?.remove();
document.querySelector("dialog[open]")?.close();

            showToast(
                `Meeting "${title}" scheduled.`
            );

            renderUpcomingMeetings();

            // Refresh the page so the meeting
            // appears immediately in the dashboard.
            setTimeout(() => {
                location.reload();
            }, 500);

        },
        "Schedule"
    );
}
/* ==========================================================
   REPORTS
========================================================== */

function showReports() {

    const total =
        messages.length;


    const announcements =
        messages.filter(
            message =>
                message.message_type ===
                "announcement"
        ).length;


    const sent =
        messages.filter(
            message =>
                message.sender_name ===
                "Claire"
        ).length;


    openModal(

        "Communication Reports",

        `

        <div
            style="
                line-height:2;
                font-size:16px;
            "
        >

            <strong>
                Total messages:
            </strong>

            ${total}

            <br>


            <strong>
                Announcements:
            </strong>

            ${announcements}

            <br>


            <strong>
                Messages sent by you:
            </strong>

            ${sent}

            <br>


            <strong>
                Current conversation:
            </strong>

            ${escapeHtml(
                currentConversation
            )}

        </div>

        `,

        modal => {

            modal.close();

        },

        "Close"

    );

}


/* ==========================================================
   ANNOUNCEMENTS
========================================================== */

function showAnnouncements() {

    const announcements =
        messages.filter(
            message =>
                message.message_type ===
                "announcement"
        );


    let html = "";


    if (!announcements.length) {

        html =
            `<p>
                No database announcements yet.
            </p>`;

    }

    else {

        announcements.forEach(
            announcement => {

                html += `

                    <div
                        style="
                            padding:14px;
                            border:1px solid #ddd;
                            border-radius:10px;
                            margin-bottom:12px;
                        "
                    >

                        <strong>

                            ${
                                escapeHtml(
                                    announcement.sender_name ||
                                    "Unknown"
                                )
                            }

                        </strong>


                        <div
                            style="
                                margin-top:7px;
                            "
                        >

                            ${
                                escapeHtml(
                                    announcement.message_text ||
                                    ""
                                )
                            }

                        </div>


                        <small>

                            ${
                                formatTime(
                                    announcement.created_at
                                )
                            }

                        </small>

                    </div>

                `;

            }
        );

    }


    openModal(

        "Recent Announcements",

        html,

        modal => {

            modal.close();

        },

        "Close"

    );

}


/* ==========================================================
   FILE SIZE
========================================================== */

function formatFileSize(bytes) {

    if (!bytes) {
        return "0 B";
    }


    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (

        (
            bytes /
            Math.pow(
                1024,
                index
            )
        ).toFixed(1)

        +

        " "

        +

        units[index]

    );

}


/* ==========================================================
   MODAL SYSTEM
========================================================== */

function openModal(
    title,
    bodyHTML,
    onConfirm,
    confirmText
) {

    const existing =
        document.getElementById(
            "staffLmsModal"
        );


    if (existing) {
        existing.remove();
    }


    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "staffLmsModal";


    overlay.style.cssText = `

        position:fixed;

        inset:0;

        z-index:100000;

        display:flex;

        align-items:center;

        justify-content:center;

        padding:20px;

        background:
            rgba(0,0,0,.45);

    `;


    const box =
        document.createElement(
            "div"
        );


    box.style.cssText = `

        width:min(
            560px,
            100%
        );

        max-height:90vh;

        overflow:auto;

        background:#fff;

        border-radius:16px;

        padding:24px;

        box-sizing:border-box;

        box-shadow:
            0 20px 60px
            rgba(0,0,0,.3);

    `;


    box.innerHTML = `

        <h2
            style="
                margin-top:0;
            "
        >

            ${escapeHtml(
                title
            )}

        </h2>


        <div
            class="staff-lms-modal-body"
        >

            ${bodyHTML}

        </div>


        <div
            style="
                display:flex;
                justify-content:flex-end;
                gap:10px;
                margin-top:20px;
            "
        >

            <button
                type="button"
                class="modal-cancel"
            >

                Cancel

            </button>


            <button
                type="button"
                class="modal-confirm"
            >

                ${escapeHtml(
                    confirmText
                )}

            </button>

        </div>

    `;


    overlay.appendChild(
        box
    );


    document.body.appendChild(
        overlay
    );


   const modal = {

    element:
        overlay,

    query:
        selector =>
            box.querySelector(
                selector
            ),

    querySelector:
        selector =>
            box.querySelector(
                selector
            ),

    close:
        () =>
            overlay.remove()

};


    box
        .querySelector(
            ".modal-cancel"
        )
        .addEventListener(
            "click",
            modal.close
        );


    box
        .querySelector(
            ".modal-confirm"
        )
        .addEventListener(
            "click",
            async () => {

                await onConfirm(
                    modal
                );

            }
        );


    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                overlay
            ) {

                modal.close();

            }

        }
    );


    setTimeout(
        () => {

            const firstInput =
                box.querySelector(
                    "input, textarea"
                );


            if (firstInput) {

                firstInput.focus();

            }

        },
        50
    );


    return modal;

}


/* ==========================================================
   TOAST
========================================================== */

function showToast(
    message,
    type = "success"
) {

    const existing =
        document.getElementById(
            "staffLmsToast"
        );


    if (existing) {
        existing.remove();
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.id =
        "staffLmsToast";


    toast.textContent =
        message;


    toast.style.cssText = `

        position:fixed;

        right:20px;

        bottom:20px;

        z-index:110000;

        max-width:420px;

        padding:13px 18px;

        border-radius:10px;

        color:#fff;

        background:
            ${
                type === "error"
                    ? "#c0392b"
                    : "#173f73"
            };

        box-shadow:
            0 8px 25px
            rgba(0,0,0,.2);

        font-size:14px;

    `;


    document.body.appendChild(
        toast
    );


    setTimeout(
        () => {

            toast.remove();

        },
        3000
    );

}


/* ==========================================================
   COUNTERS
========================================================== */

function updateCounters() {

    const unread =
        messages.filter(
            message =>
                !message.is_read
        ).length;


    const announcements =
        messages.filter(
            message =>
                message.message_type ===
                "announcement"
        ).length;


    const cards =
        document.querySelectorAll(
            ".messages-kpis .kpi-card"
        );


    /*
       Unread messages
    */

    if (cards[0]) {

        const number =
            cards[0].querySelector(
                "h2"
            );


        if (number) {

            number.textContent =
                unread;

        }

    }


    /*
       Announcements
    */

    if (cards[2]) {

        const number =
            cards[2].querySelector(
                "h2"
            );


        if (number) {

            number.textContent =
                announcements;

        }

    }

}


/* ==========================================================
   HELPERS
========================================================== */

function getInitials(name) {

    if (!name) {
        return "?";
    }


    return String(name)

        .trim()

        .split(
            /\s+/
        )

        .map(
            word =>
                word.charAt(0)
        )

        .join("")

        .substring(
            0,
            2
        )

        .toUpperCase();

}


function formatTime(
    dateString
) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return date.toLocaleTimeString(
        [],
        {
            hour:
                "numeric",

            minute:
                "2-digit"
        }
    );

}


function escapeHtml(
    value
) {

    return String(
        value ?? ""
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}

})();