-- Enable Row Level Security on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Helper function to check role of current user
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS public."Role" AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Helper function to check company_id of current user
CREATE OR REPLACE FUNCTION public.current_user_company_id()
RETURNS integer AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies for public.profiles
CREATE POLICY "Users can read their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can manage profiles of their company"
  ON public.profiles FOR ALL
  USING (
    company_id = public.current_user_company_id() 
    AND public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
  );

-- Policies for public.companies
CREATE POLICY "Super admins can manage all companies"
  ON public.companies FOR ALL
  USING (public.current_user_role() = 'SUPER_ADMIN');

CREATE POLICY "Users can view their own company"
  ON public.companies FOR SELECT
  USING (id = public.current_user_company_id());

CREATE POLICY "Admins can update their own company"
  ON public.companies FOR UPDATE
  USING (
    id = public.current_user_company_id()
    AND public.current_user_role() = 'ADMIN'
  );

-- Policies for public.sites
CREATE POLICY "Users can view sites of their company"
  ON public.sites FOR SELECT
  USING (company_id = public.current_user_company_id());

CREATE POLICY "Admins can manage sites of their company"
  ON public.sites FOR ALL
  USING (
    company_id = public.current_user_company_id()
    AND public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
  );

-- Policies for public.positions
CREATE POLICY "Users can view positions of their company"
  ON public.positions FOR SELECT
  USING (company_id = public.current_user_company_id());

CREATE POLICY "Admins can manage positions of their company"
  ON public.positions FOR ALL
  USING (
    company_id = public.current_user_company_id()
    AND public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
  );

-- Policies for public.employees
CREATE POLICY "Users can view employees of their company"
  ON public.employees FOR SELECT
  USING (company_id = public.current_user_company_id());

CREATE POLICY "Admins can manage employees of their company"
  ON public.employees FOR ALL
  USING (
    company_id = public.current_user_company_id()
    AND public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
  );

-- Policies for public.attendances
CREATE POLICY "Employees can view and create their own attendances"
  ON public.attendances FOR ALL
  USING (
    employee_id = (SELECT employee_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins and managers can view attendances of their company"
  ON public.attendances FOR SELECT
  USING (
    (SELECT company_id FROM public.employees WHERE id = employee_id) = public.current_user_company_id()
    AND public.current_user_role() IN ('ADMIN', 'MANAGER', 'SUPER_ADMIN')
  );

-- Policies for public.leave_types
CREATE POLICY "Users can view leave types of their company"
  ON public.leave_types FOR SELECT
  USING (company_id = public.current_user_company_id());

CREATE POLICY "Admins can manage leave types of their company"
  ON public.leave_types FOR ALL
  USING (
    company_id = public.current_user_company_id()
    AND public.current_user_role() IN ('ADMIN', 'SUPER_ADMIN')
  );

-- Policies for public.leave_requests
CREATE POLICY "Employees can view and create their own leave requests"
  ON public.leave_requests FOR ALL
  USING (
    employee_id = (SELECT employee_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Managers and admins can view and validate leave requests of their company"
  ON public.leave_requests FOR ALL
  USING (
    (SELECT company_id FROM public.employees WHERE id = employee_id) = public.current_user_company_id()
    AND public.current_user_role() IN ('ADMIN', 'MANAGER', 'SUPER_ADMIN')
  );
