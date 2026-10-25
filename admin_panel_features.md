Super Admin: 
	1. Analytics Dashboard
	2. Add New User
	3. Disable Users (Not Admin)
	4. Category & Sub category Management
	5. User role change (Not Admin) 
	6. Publish, Approve, Edit, Archive Articles
	7. Handpicked News, Breaking News
Admin:
	1. Analytics Dashboard
	2. Request New User
	3. Request Disable User
	4. Request User role change
	5. Notified about User & curation changes by admin
	6. Publish, Approve, Edit, Archive Articles
	7. Handpicked News, Breaking News
Editor in chief: 
	1. Handpicked News, Breaking News
	2. Post, Approve, Edit, Archive Articles
Editor:
	1. Post, Approve, Edit, Archive Articles
Sub editor:
	1. Edit or pass Article from reporter and submit for publishing
	2. Write Articles and Submit
Reporter
	1. Write Articles and Submit


#Analytics Dashboard: manual view counting
1. Total Visits/ Page views – all time and calendar
2. Most visited category articles
3. Most visited subcategory articles
4. Most visited pages
5. Audit logs of administrative actions

exclusive Tabs:
*Super admin & admin includes all the tabs the editors and reporters contains
#Super admin exclusive tabs:
1. User tab
	1. List of users
	2. Add new user button with a following form (initially email and password will be set by super admin. Later that user's account password and name can be changed)
	3. Change roles of existing users
	4. Disable users (can be enabled later)
2. Category & Subcategory management tab
	1. CRUD Categories and subcategories
3. List of All requests from admin

#Admin Exclusive tabs:
1. Can see user list but can’t edit
2. Additional request tab for requesting changes to super admin

------------------------------

Technical choices:
1. Raw MySQL (`mysql2/promise`) / TiDB (utf8mb4, zero ORM)
2. Cloudflare adapter, wrangler
3. JWT tokenization
4. common standard nodejs module workarounds – example: jose for crypto
5. Next.js Edge Middleware
6. On-Demand Incremental Static Regeneration (ISR). Only for admin operations that impact public frontend
7. Auth state must be anchored in HTTP-only cookies. Use Next.js Middleware to intercept routes and check token validity before the page renders.

Architecture: Server Driven Component Architecture
Data Flow: Database / CMS - Data Access Layer (Repositories) - Server Components - Client.
Repository: Direct database read write (query) functions
Server components: takes the repository function’s data and render the ui
Server actions: Server Actions catch user input then pass to repository to update db

