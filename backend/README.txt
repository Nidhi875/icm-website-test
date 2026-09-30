GGA STUDENT DETAILS / EXCEL SYNC FIX

Replace these backend/frontend files in the corresponding project locations:

1. Student Portal/js/admin.js
   - Fixes Edit Student 404 by calling PUT /api/students/:id/details.
   - Preserves existing student data when only name/email/status/fee are edited.
   - Student Details loads the latest Operations Excel values.
   - Shows Application Status and Fee Amount in the Application section.

2. Backend/controllers/studentDetailsController.js
   - Student Details joins users + applications + operations_student_progression.
   - Operations Excel values take precedence for application status, offer status,
     admission status, course, university, destination country and fee when present.
   - Works even before the Operations table exists.
   - Partial admin edits no longer erase profile/academic/application fields.

3. Backend/routes/studentsRoutes.js
   - Keeps GET /api/students/:id/details and PUT /api/students/:id/details
     connected to the controller.

4. Backend/routes/operationsAdmissionsRoutes.js
   - After Excel import, synchronizes matching students (by Student ID) into
     applications for course/university/country/status/offer/admission/fee.
   - Operations table remains the source of truth for the Student Details display.

IMPORTANT:
- Your server.js must mount these routes as it currently does:
  app.use('/api/students', studentsRoutes);
  app.use('/api/operations', operationsAdmissionsRoutes);
- Restart/redeploy the Railway backend after replacing the backend files.
- Then hard-refresh the admin page (Ctrl+Shift+R).

TEST:
1. Open Admin > Student Records.
2. Click View for a student.
3. Confirm the Student Details modal loads.
4. In Operations, upload the Excel file containing that student's Student ID.
5. Change one Excel value, e.g. Application Status = Confirmed.
6. Upload it again.
7. Open View again. Application Status should now show Confirmed.
8. Change the Excel value again (e.g. Offer Status) and re-import to verify live updates.
