
SELECT pg_catalog.set_config('search_path', '', false);

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

CREATE TABLE public.games (
	id text NOT NULL,
	topic_id integer,
	players integer[],
	data jsonb,
	version text NOT NULL,
	started_at timestamp with time zone NOT NULL,
	duration integer,
	completed boolean,
	mode text
);

CREATE TABLE public.topics (
	id integer NOT NULL,
	name text NOT NULL,
	created_at timestamp with time zone DEFAULT now() NOT NULL,
	updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE SEQUENCE public.topics_id_seq
	AS integer
	START WITH 1
	INCREMENT BY 1
	NO MINVALUE
	NO MAXVALUE
	CACHE 1;

ALTER SEQUENCE public.topics_id_seq OWNED BY public.topics.id;

CREATE TABLE public.user_activities (
	id integer NOT NULL,
	user_id integer,
	body text,
	created_at timestamp with time zone DEFAULT now() NOT NULL,
	updated_at timestamp with time zone DEFAULT now() NOT NULL,
	target_id integer,
	target_type text,
	reply_id integer,
	action text
);

CREATE SEQUENCE public.user_activities_id_seq
	AS integer
	START WITH 1
	INCREMENT BY 1
	NO MINVALUE
	NO MAXVALUE
	CACHE 1;

ALTER SEQUENCE public.user_activities_id_seq OWNED BY public.user_activities.id;

CREATE TABLE public.user_activity_reactions (
	activity_id integer NOT NULL,
	user_id integer NOT NULL,
	reaction text NOT NULL,
	created_at timestamp with time zone DEFAULT now(),
	updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.user_follows (
	user_id integer NOT NULL,
	target_id integer NOT NULL,
	target_type text NOT NULL,
	created_at timestamp with time zone DEFAULT now() NOT NULL,
	updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.user_game_scores (
	user_id integer NOT NULL,
	topic_id integer NOT NULL,
	mode text NOT NULL,
	score integer,
	created_at timestamp with time zone DEFAULT now(),
	updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.user_sessions (
	id uuid DEFAULT public.gen_random_uuid() NOT NULL,
	user_id integer,
	created_at timestamp with time zone DEFAULT now() NOT NULL,
	updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.users (
	id integer NOT NULL,
	email public.citext NOT NULL,
	created_at timestamp with time zone DEFAULT now() NOT NULL,
	updated_at timestamp with time zone DEFAULT now() NOT NULL,
	passcode integer,
	passcode_at timestamp with time zone,
	passcode_attempts integer,
	email_status text,
	email_change text,
	name public.citext NOT NULL,
	ccid integer,
	md5 text,
	admin boolean,
	game_count integer DEFAULT 0,
	quit_count integer DEFAULT 0
);

CREATE SEQUENCE public.users_id_seq
	AS integer
	START WITH 1
	INCREMENT BY 1
	NO MINVALUE
	NO MAXVALUE
	CACHE 1;

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;

ALTER TABLE ONLY public.topics ALTER COLUMN id SET DEFAULT nextval('public.topics_id_seq'::regclass);

ALTER TABLE ONLY public.user_activities ALTER COLUMN id SET DEFAULT nextval('public.user_activities_id_seq'::regclass);

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);

ALTER TABLE ONLY public.games
	ADD CONSTRAINT games_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.topics
	ADD CONSTRAINT topics_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_activities
	ADD CONSTRAINT user_activities_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_activity_reactions
	ADD CONSTRAINT user_activity_reactions_pkey PRIMARY KEY (activity_id, user_id);

ALTER TABLE ONLY public.user_follows
	ADD CONSTRAINT user_follows_pkey PRIMARY KEY (user_id, target_id, target_type);

ALTER TABLE ONLY public.user_game_scores
	ADD CONSTRAINT user_game_scores_pkey PRIMARY KEY (user_id, topic_id, mode);

ALTER TABLE ONLY public.user_sessions
	ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
	ADD CONSTRAINT users_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.user_follows
	ADD CONSTRAINT follows_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.games
	ADD CONSTRAINT games_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id);

ALTER TABLE ONLY public.user_activities
	ADD CONSTRAINT user_activities_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.user_activity_reactions
	ADD CONSTRAINT user_activity_reactions_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.user_activities(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.user_activity_reactions
	ADD CONSTRAINT user_activity_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.user_game_scores
	ADD CONSTRAINT user_game_scores_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.user_game_scores
	ADD CONSTRAINT user_game_scores_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE ONLY public.user_sessions
	ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;
