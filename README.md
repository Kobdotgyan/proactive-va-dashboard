# ProActive VA Dashboard

A premium client management and task automation dashboard for a technical virtual assistant. This project is built as a lightweight front-end app with browser persistence and a polished SaaS-style interface.

## Features

- Client intake form
- Task creation and editing
- Task status tracking
- Due dates and priority tags
- Search and filtering for tasks
- Local browser persistence with `localStorage`
- Premium dashboard styling with executive-assistant branding

## Project Structure

```text
va-automation-suite/
├── index.html
├── style.css
├── script.js
├── README.md
└── .gitignore (optional)
```

## How to Run

1. Open the project folder in your browser.
2. Either:
   - open `index.html` directly in a browser, or
   - run a local static server from the folder.

Example using Python:

```bash
cd va-automation-suite
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```
https://kobdotgyan.github.io/proactive-va-dashboard/

## Usage

- Add a client in the **New Client Intake** section.
- Create a task from the **New Task** button.
- Edit any task from the task card.
- Search and filter tasks by name, status, and priority.
- Data stays saved in the browser using local storage.

## Notes

This version is a front-end dashboard prototype designed for demonstration and portfolio use. It is not yet connected to a backend database or authentication system.

## Future Enhancements

- Email template library
- calendar integration
- dashboard analytics and charts
- backend/API integration
- database persistence with SQLite or PostgreSQL
- user login and role management
