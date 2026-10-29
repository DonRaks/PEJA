# ADDENDUM — PEJA VENTURES CONTENT MANAGEMENT SYSTEM AND INSTALLABLE ADMIN PWA

Extend the existing Peja Ventures Next.js/React website with a secure, responsive content-management dashboard.

This is an addition to the existing cinematic website redesign. Preserve the agreed visual direction, GSAP animation strategy, existing functionality, and four-business architecture.

## A. PUBLIC WEBSITE AND ADMIN DASHBOARD

Create two distinct experiences within the same application:

1. The public-facing Peja Ventures website.
2. A private, authenticated Peja Studio administration dashboard.

The public website remains cinematic, editorial, image-led, and optimized for customers.

The admin dashboard is a functional content-management interface optimized for speed, clarity, mobile uploads, and reliable publishing.

Use separate layouts and appropriate route protection. The dashboard must never be accessible merely because someone knows its URL.

Suggested routes:
- /admin
- /admin/projects
- /admin/media
- /admin/divisions
- /admin/settings

Preserve existing public routes and choose route names that fit the current project architecture.

## B. FOUR DIVISIONS AND INDEPENDENT CONTENT MANAGEMENT

Support these divisions:
- Peja Cleaning.
- Peja Agriculture.
- Peja Logistics.
- Peja Clothing.

Each division must have its own public landing page and a corresponding content-management view.

The administrator must be able to select a division when creating or editing a content item.

Each division should support appropriate content types:
- Cleaning: completed projects, service galleries, before-and-after assets, and service content.
- Agriculture: produce listings, product images, sourcing information, and availability content.
- Logistics: project galleries, service images, and operational case studies.
- Clothing: product or collection images, lookbooks, and collection descriptions.

Use shared content-management components where practical while allowing each division to display content in its own appropriate layout.

## C. PROJECT AND MEDIA UPLOAD WORKFLOW

Create an Add New Project workflow with:
- Project title.
- Description.
- Business division.
- Content category.
- Multiple image uploads.
- Image preview and reordering.
- Alt text.
- Optional location or other appropriate metadata.
- Featured-content selection.
- Publication status.
- Save Draft.
- Preview.
- Publish.
- Edit.
- Unpublish.
- Archive.

Provide drag-and-drop uploads where appropriate, a mobile file picker, upload progress, file validation, helpful errors, and clear success states.

Support editing an existing project without requiring the administrator to upload all of its media again.

Store media in persistent object storage, not in the deployed application's local filesystem.

Store structured metadata in the database and reference uploaded assets from the relevant content records.

## D. CONTENT PLACEMENT CONTROLS

This is a core feature.

For each content item, let the administrator select where it appears:
- Its division's main gallery.
- The homepage's featured-work section.
- A relevant service or collection category.
- Other explicitly configured content slots where appropriate.

The division assignment and placement assignment must be separate fields.

For example, a cleaning project may belong to Peja Cleaning, appear in the Cleaning gallery, and optionally appear in the homepage's featured-work section.

A single content item must be reusable across multiple approved placements without duplicate uploads.

Build a configurable content-placement model rather than hardcoding a separate upload form for every section.

The public frontend must retrieve the appropriate published content based on its division, placement, category, and ordering.

## E. PUBLISHING RULES

Support these states:
- Draft.
- Published.
- Archived.

If scheduling is implemented, also support scheduled publication with reliable server-side behavior.

Draft and archived content must not appear publicly.

Publishing must validate required fields and media before changing visibility.

Unpublishing should remove content from public listings while retaining the underlying record and media references.

Homepage features should be selected explicitly rather than automatically displaying every new upload.

Support sorting and reordering within each placement.

Provide an accurate preview of the content before publication.

## F. ADMIN DASHBOARD EXPERIENCE

Create a polished dashboard with:
- Overview and content counts.
- Recent activity.
- Projects and media management.
- Business-division navigation.
- Draft and published filters.
- Search and sorting.
- Quick upload actions.
- Site content settings.
- Account management appropriate to the administrator's permissions.

The dashboard must be responsive and usable on phones, tablets, and desktops.

Design the upload experience mobile-first so the client can photograph completed work, select images, add details, and publish without a computer.

Use the Peja color palette and typography as a foundation, but prioritize functional clarity over cinematic effects.

Do not apply lengthy GSAP entrances to the dashboard. Use restrained CSS transitions and only lightweight interactions that improve usability.

## G. BACKEND AND SECURITY

Inspect the existing backend before choosing a data architecture.

If a suitable backend is not already configured, consider:
- Supabase Auth for authentication.
- PostgreSQL for structured content.
- Supabase Storage for image files.

Preserve existing compatible infrastructure rather than adding duplicate services unnecessarily.

Requirements:
- Secure authentication.
- Protected administration routes.
- Server-side authorization.
- Database access policies.
- Storage upload and read policies.
- Server-side input validation.
- File type and size restrictions.
- Safe handling of upload failures.
- Secure secret management.
- Appropriate ownership and permission checks.
- No service-role secrets in client-side code.
- No reliance on hiding admin buttons as an authorization mechanism.

Public visitors should only be able to retrieve content approved for publication.

Administrative operations must be authorized on the server and enforced by the underlying database and storage permissions where supported.

Do not implement fake authentication or mock publishing as though it were connected to a real backend.

## H. INSTALLABLE PROGRESSIVE WEB APP

Make the admin dashboard installable as a PWA on supported devices.

Implement:
- A valid web app manifest.
- Application name and short name.
- Appropriate application icons.
- Theme and background colors.
- Suitable standalone display behavior.
- A service worker using a compatible implementation.
- Appropriate installation guidance.
- An accessible responsive interface.

Protect private content from being cached publicly.

Do not cache authenticated administration API responses or sensitive content in an unsafe manner.

Uploading, publishing, authentication, and other server-dependent operations must communicate their connection state and handle offline errors clearly.

Offline editing or upload queues should only be implemented if their synchronization and conflict behavior can be handled reliably. They are not required for the initial release.

## I. CONTENT DELIVERY TO THE PUBLIC WEBSITE

Build reusable server-side queries or appropriately secured data-access functions for retrieving published content.

Each public business page must automatically display the content assigned to it.

The homepage should show only the items explicitly assigned to its featured-content placement.

Content updates should become visible after publication without requiring a source-code change or a new deployment.

Configure cache invalidation or revalidation as appropriate to the existing Next.js version and rendering architecture.

Avoid exposing drafts, private media, internal metadata, or administrator information through public endpoints.

Use responsive image optimization and suitable thumbnail sizes for galleries.

## J. MULTI-CLIENT READINESS

The first deployment is for Peja Ventures.

However, structure the system so it can be extended into a reusable client-management solution in the future.

Where appropriate, include a client or organization ownership relationship in content records.

Enforce tenant isolation in server authorization, database policies, and storage permissions if multiple client organizations are supported.

Do not build an unnecessarily complicated SaaS platform in the first release. Prioritize a reliable Peja deployment and avoid decisions that would make future client isolation difficult.

## K. TESTING AND ACCEPTANCE CRITERIA

Verify that:
1. An authorized administrator can log in.
2. An unauthorized visitor cannot access administrative functionality.
3. The administrator can create a content item and upload multiple images.
4. The administrator can assign the content to a division and one or more placements.
5. Draft content stays private.
6. Publishing makes the content appear in the correct public locations.
7. Homepage features can be managed independently from division galleries.
8. Existing projects can be edited and unpublished.
9. Uploaded media persists across deployments.
10. The dashboard works on mobile and can be installed on supported devices.
11. Private data and unpublished content cannot be retrieved through public endpoints.
12. Existing public routes and the cinematic homepage continue to work.
13. The project passes available type checks, lint checks, tests, and production build.

Report any backend credentials, storage configuration, hosting configuration, or integration work still required.

Do not claim that the CMS or PWA is complete until the relevant functionality has actually been implemented and tested.

Deliver a working, secure content-management system integrated with the existing Peja Ventures website.

Work autonomously on this project from implementation through verification.

- Inspect the existing project structure and understand the current code before making changes.
- Follow the agreed architecture and preserve existing functionality.
- Implement the project in logical phases, completing each phase before moving to the next.
- Create and modify project files as needed without asking me to approve every individual edit.
- Run appropriate installation, development, linting, type-checking, and build commands when necessary.
- Diagnose errors, fix them, and rerun relevant checks.
- Do not stop after producing a plan; proceed with implementation.
- Do not ask me to approve routine, safe, reversible development operations.
- If one operation requires approval, complete all other independent work that can safely proceed.
- Never expose secrets, delete important user data, overwrite unrelated projects, or execute destructive commands without checking first.
- Do not deploy to production, spend money, or modify external services without my explicit authorization.
- At completion, summarize what was implemented, files changed, checks performed, and anything still requiring my attention.

Continue working until the requested task is implemented and verified, rather than stopping after each small step.