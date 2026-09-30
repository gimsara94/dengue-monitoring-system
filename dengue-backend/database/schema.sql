-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.chart_labs (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  hospital_id integer NOT NULL,
  ward_id integer NOT NULL,
  patient_id integer NOT NULL,
  pcv_percentage numeric,
  plt_count integer,
  wbc_total numeric,
  chart_date date NOT NULL,
  chart_time time without time zone NOT NULL,
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  recorded_by integer,
  CONSTRAINT chart_labs_pkey PRIMARY KEY (id),
  CONSTRAINT fk_labs_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT fk_labs_ward FOREIGN KEY (hospital_id) REFERENCES public.wards(hospital_id),
  CONSTRAINT fk_labs_ward FOREIGN KEY (ward_id) REFERENCES public.wards(hospital_id),
  CONSTRAINT fk_labs_ward FOREIGN KEY (hospital_id) REFERENCES public.wards(ward_id),
  CONSTRAINT fk_labs_ward FOREIGN KEY (ward_id) REFERENCES public.wards(ward_id),
  CONSTRAINT fk_labs_login FOREIGN KEY (recorded_by) REFERENCES public.logins(id)
);
CREATE TABLE public.chart_observations (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  hospital_id integer NOT NULL,
  ward_id integer NOT NULL,
  patient_id integer NOT NULL,
  observation_text text NOT NULL,
  chart_date date NOT NULL,
  chart_time time without time zone NOT NULL,
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  recorded_by integer,
  CONSTRAINT chart_observations_pkey PRIMARY KEY (id),
  CONSTRAINT fk_obs_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT fk_obs_ward FOREIGN KEY (hospital_id) REFERENCES public.wards(hospital_id),
  CONSTRAINT fk_obs_ward FOREIGN KEY (ward_id) REFERENCES public.wards(hospital_id),
  CONSTRAINT fk_obs_ward FOREIGN KEY (hospital_id) REFERENCES public.wards(ward_id),
  CONSTRAINT fk_obs_ward FOREIGN KEY (ward_id) REFERENCES public.wards(ward_id),
  CONSTRAINT fk_obs_login FOREIGN KEY (recorded_by) REFERENCES public.logins(id)
);
CREATE TABLE public.chart_vitals (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  hospital_id integer NOT NULL,
  ward_id integer NOT NULL,
  patient_id integer NOT NULL,
  pr_min integer,
  bp_supine_sys integer,
  bp_supine_dia integer,
  pulse_pressure integer,
  bp_sitting_sys integer,
  bp_sitting_dia integer,
  crft character varying,
  rr_min integer,
  chart_date date NOT NULL,
  chart_time time without time zone NOT NULL,
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  recorded_by integer,
  CONSTRAINT chart_vitals_pkey PRIMARY KEY (id),
  CONSTRAINT fk_vitals_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT fk_vitals_ward FOREIGN KEY (hospital_id) REFERENCES public.wards(hospital_id),
  CONSTRAINT fk_vitals_ward FOREIGN KEY (ward_id) REFERENCES public.wards(hospital_id),
  CONSTRAINT fk_vitals_ward FOREIGN KEY (hospital_id) REFERENCES public.wards(ward_id),
  CONSTRAINT fk_vitals_ward FOREIGN KEY (ward_id) REFERENCES public.wards(ward_id),
  CONSTRAINT fk_vitals_login FOREIGN KEY (recorded_by) REFERENCES public.logins(id)
);
CREATE TABLE public.chart_volumes (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  hospital_id integer NOT NULL,
  ward_id integer NOT NULL,
  patient_id integer NOT NULL,
  oral_ml integer DEFAULT 0,
  n_saline_ml integer DEFAULT 0,
  dextran_40_ml integer DEFAULT 0,
  tetrastarch_ml integer DEFAULT 0,
  blood_ml integer DEFAULT 0,
  other_ml integer DEFAULT 0,
  chart_date date NOT NULL,
  chart_time time without time zone NOT NULL,
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  recorded_by integer,
  CONSTRAINT chart_volumes_pkey PRIMARY KEY (id),
  CONSTRAINT fk_volumes_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT fk_volumes_ward_hid FOREIGN KEY (hospital_id) REFERENCES public.wards(hospital_id),
  CONSTRAINT fk_volumes_ward_wid FOREIGN KEY (ward_id) REFERENCES public.wards(ward_id),
  CONSTRAINT fk_volumes_login FOREIGN KEY (recorded_by) REFERENCES public.logins(id)
);
CREATE TABLE public.chart_urine (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  hospital_id integer NOT NULL,
  ward_id integer NOT NULL,
  patient_id integer NOT NULL,
  urine_ml integer,
  hour character varying,
  end_time time without time zone,
  chart_date date NOT NULL,
  chart_time time without time zone NOT NULL,
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  recorded_by integer,
  CONSTRAINT chart_urine_pkey PRIMARY KEY (id),
  CONSTRAINT fk_urine_patient FOREIGN KEY (patient_id) REFERENCES public.patients(id),
  CONSTRAINT fk_urine_ward FOREIGN KEY (hospital_id, ward_id) REFERENCES public.wards(hospital_id, ward_id),
  CONSTRAINT fk_urine_login FOREIGN KEY (recorded_by) REFERENCES public.logins(id)
);
CREATE TABLE public.doctors (
  id integer NOT NULL DEFAULT nextval('doctors_id_seq'::regclass),
  name character varying NOT NULL,
  telephone character varying NOT NULL,
  nic_no character varying NOT NULL UNIQUE,
  address character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  login_id integer UNIQUE,
  hospital_id integer,
  CONSTRAINT doctors_pkey PRIMARY KEY (id),
  CONSTRAINT fk_doctors_login FOREIGN KEY (login_id) REFERENCES public.logins(id),
  CONSTRAINT doctors_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id)
);
CREATE TABLE public.hospitals (
  id integer NOT NULL DEFAULT nextval('hospitals_id_seq'::regclass),
  name character varying NOT NULL UNIQUE,
  address character varying NOT NULL,
  telephone character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  login_id integer UNIQUE,
  CONSTRAINT hospitals_pkey PRIMARY KEY (id),
  CONSTRAINT hospitals_login_id_fkey FOREIGN KEY (login_id) REFERENCES public.logins(id)
);
CREATE TABLE public.logins (
  id integer GENERATED ALWAYS AS IDENTITY NOT NULL,
  username character varying NOT NULL UNIQUE,
  password_hash character varying NOT NULL,
  role USER-DEFINED NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT logins_pkey PRIMARY KEY (id)
);
CREATE TABLE public.nurses (
  id integer NOT NULL DEFAULT nextval('nurses_id_seq'::regclass),
  name character varying NOT NULL,
  telephone character varying NOT NULL,
  nic_no character varying NOT NULL UNIQUE,
  address character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  login_id integer UNIQUE,
  hospital_id integer,
  CONSTRAINT nurses_pkey PRIMARY KEY (id),
  CONSTRAINT fk_nurses_login FOREIGN KEY (login_id) REFERENCES public.logins(id),
  CONSTRAINT nurses_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id)
);
CREATE TABLE public.patients (
  id integer NOT NULL DEFAULT nextval('patients_id_seq'::regclass),
  name character varying NOT NULL,
  b_day date NOT NULL,
  nic character varying NOT NULL UNIQUE,
  telephone character varying NOT NULL,
  address character varying NOT NULL,
  hospital_id integer NOT NULL,
  ward_id integer NOT NULL,
  bed_no character varying NOT NULL,
  is_discharged boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_critical boolean DEFAULT false,
  CONSTRAINT patients_pkey PRIMARY KEY (id),
  CONSTRAINT patients_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id),
  CONSTRAINT fk_patients_ward FOREIGN KEY (hospital_id) REFERENCES public.wards(hospital_id),
  CONSTRAINT fk_patients_ward FOREIGN KEY (ward_id) REFERENCES public.wards(hospital_id),
  CONSTRAINT fk_patients_ward FOREIGN KEY (hospital_id) REFERENCES public.wards(ward_id),
  CONSTRAINT fk_patients_ward FOREIGN KEY (ward_id) REFERENCES public.wards(ward_id)
);
CREATE TABLE public.ward_doctors (
  hospital_id integer NOT NULL,
  ward_id integer NOT NULL,
  doctor_id integer NOT NULL,
  CONSTRAINT ward_doctors_pkey PRIMARY KEY (hospital_id, ward_id, doctor_id),
  CONSTRAINT fk_ward_doctors_ward FOREIGN KEY (hospital_id) REFERENCES public.wards(hospital_id),
  CONSTRAINT fk_ward_doctors_ward FOREIGN KEY (ward_id) REFERENCES public.wards(hospital_id),
  CONSTRAINT fk_ward_doctors_ward FOREIGN KEY (hospital_id) REFERENCES public.wards(ward_id),
  CONSTRAINT fk_ward_doctors_ward FOREIGN KEY (ward_id) REFERENCES public.wards(ward_id),
  CONSTRAINT fk_ward_doctors_doctor FOREIGN KEY (doctor_id) REFERENCES public.doctors(id)
);
CREATE TABLE public.ward_nurses (
  hospital_id integer NOT NULL,
  ward_id integer NOT NULL,
  nurse_id integer NOT NULL,
  CONSTRAINT ward_nurses_pkey PRIMARY KEY (hospital_id, ward_id, nurse_id),
  CONSTRAINT fk_ward_nurses_ward FOREIGN KEY (hospital_id) REFERENCES public.wards(hospital_id),
  CONSTRAINT fk_ward_nurses_ward FOREIGN KEY (ward_id) REFERENCES public.wards(hospital_id),
  CONSTRAINT fk_ward_nurses_ward FOREIGN KEY (hospital_id) REFERENCES public.wards(ward_id),
  CONSTRAINT fk_ward_nurses_ward FOREIGN KEY (ward_id) REFERENCES public.wards(ward_id),
  CONSTRAINT fk_ward_nurses_nurse FOREIGN KEY (nurse_id) REFERENCES public.nurses(id)
);
CREATE TABLE public.wards (
  hospital_id integer NOT NULL,
  ward_id integer NOT NULL,
  beds integer NOT NULL CHECK (beds >= 0),
  login_id integer UNIQUE,
  CONSTRAINT wards_pkey PRIMARY KEY (hospital_id, ward_id),
  CONSTRAINT wards_hospital_id_fkey FOREIGN KEY (hospital_id) REFERENCES public.hospitals(id),
  CONSTRAINT fk_wards_login FOREIGN KEY (login_id) REFERENCES public.logins(id)
);