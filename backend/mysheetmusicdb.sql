--
-- PostgreSQL database dump
--

-- Dumped from database version 13.1
-- Dumped by pg_dump version 13.1

-- Started on 2021-05-10 08:57:36

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE mysheetmusic;
--
-- TOC entry 3015 (class 1262 OID 49735)
-- Name: mysheetmusic; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE mysheetmusic WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'English_United States.1252';


ALTER DATABASE mysheetmusic OWNER TO postgres;

\connect mysheetmusic

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 201 (class 1259 OID 49738)
-- Name: library; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.library (
    id integer NOT NULL,
    title text NOT NULL,
    composer text NOT NULL,
    genre text,
    popular boolean,
    epoch character varying(20),
    birth character varying(10)
);


ALTER TABLE public.library OWNER TO postgres;

--
-- TOC entry 200 (class 1259 OID 49736)
-- Name: library_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.library_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.library_id_seq OWNER TO postgres;

--
-- TOC entry 3016 (class 0 OID 0)
-- Dependencies: 200
-- Name: library_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.library_id_seq OWNED BY public.library.id;


--
-- TOC entry 203 (class 1259 OID 49749)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(30) NOT NULL,
    hashed_password text NOT NULL,
    email text NOT NULL,
    username character varying(20) NOT NULL,
    is_admin boolean
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 202 (class 1259 OID 49747)
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO postgres;

--
-- TOC entry 3017 (class 0 OID 0)
-- Dependencies: 202
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_id_seq OWNED BY public.users.id;


--
-- TOC entry 205 (class 1259 OID 49764)
-- Name: user_library; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_library (
    id integer NOT NULL,
    user_id integer,
    library_id integer,
    api_id integer,
    owned boolean,
    digital boolean,
    physical boolean,
    played boolean,
    loanedout boolean,
    notes text
);


ALTER TABLE public.user_library OWNER TO postgres;

--
-- TOC entry 204 (class 1259 OID 49762)
-- Name: user_library_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_library_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_library_id_seq OWNER TO postgres;

--
-- TOC entry 3018 (class 0 OID 0)
-- Dependencies: 204
-- Name: user_library_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_library_id_seq OWNED BY public.user_library.id;


--
-- TOC entry 2865 (class 2604 OID 49741)
-- Name: library id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.library ALTER COLUMN id SET DEFAULT nextval('public.library_id_seq'::regclass);


--
-- TOC entry 2867 (class 2604 OID 49767)
-- Name: user_library id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_library ALTER COLUMN id SET DEFAULT nextval('public.user_library_id_seq'::regclass);


--
-- TOC entry 2866 (class 2604 OID 49752)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- TOC entry 2869 (class 2606 OID 49746)
-- Name: library library_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.library
    ADD CONSTRAINT library_pkey PRIMARY KEY (id);


--
-- TOC entry 2871 (class 2606 OID 49761)
-- Name: users user_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- TOC entry 2877 (class 2606 OID 49772)
-- Name: user_library user_library_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_library
    ADD CONSTRAINT user_library_pkey PRIMARY KEY (id);


--
-- TOC entry 2873 (class 2606 OID 49757)
-- Name: users user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- TOC entry 2874 (class 1259 OID 49804)
-- Name: fki_ user_library_user_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "fki_ user_library_user_id_fkey" ON public.user_library USING btree (user_id);


--
-- TOC entry 2875 (class 1259 OID 49798)
-- Name: fki_user_library_library_id_fkey; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX fki_user_library_library_id_fkey ON public.user_library USING btree (library_id);


--
-- TOC entry 2878 (class 2606 OID 49799)
-- Name: user_library  user_library_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_library
    ADD CONSTRAINT " user_library_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 2879 (class 2606 OID 49805)
-- Name: user_library user_library_library_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_library
    ADD CONSTRAINT user_library_library_id_fkey FOREIGN KEY (library_id) REFERENCES public.library(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2021-05-10 08:57:36

--
-- PostgreSQL database dump complete
--

