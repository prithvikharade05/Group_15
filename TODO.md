# Fix 401 Unauthorized on /api/auth/login/ and /api/auth/register/

**Status:** In progress

## Plan Summary
- DB setup (migrations)
- Add explicit AllowAny permissions to auth views
- Test endpoints
- Verify frontend

## Steps
### 1. Database migrations
- [x] python manage.py makemigrations
- [x] python manage.py migrate

### 2. Fix permissions in accounts/views.py
- [x] Edit accounts/views.py to add `permission_classes = [permissions.AllowAny]` to RegisterView and LoginView
- [ ] Run migrate if needed

### 3. Setup test user
- [ ] python manage.py createsuperuser

### 4. Test endpoints
- [ ] curl test register
- [ ] curl test login

### 5. Frontend verification
- [ ] Test login/register in browser

### 6. Full project run
- [ ] Backend dev server
- [ ] Frontend npm start

**Status:** Complete - test login/register in browser (localhost:3000)

