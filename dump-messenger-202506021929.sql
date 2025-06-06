PGDMP                      }         	   messenger    16.2 (Debian 16.2-1.pgdg120+2)    17.4 =    a           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            b           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            c           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            d           1262    65866 	   messenger    DATABASE     t   CREATE DATABASE messenger WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';
    DROP DATABASE messenger;
                     postgres    false            �            1259    66096    albums    TABLE     w   CREATE TABLE public.albums (
    id integer NOT NULL,
    owner_id integer,
    created_at timestamp with time zone
);
    DROP TABLE public.albums;
       public         heap r       postgres    false            �            1259    66095    albums_id_seq    SEQUENCE     �   CREATE SEQUENCE public.albums_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.albums_id_seq;
       public               postgres    false    220            e           0    0    albums_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.albums_id_seq OWNED BY public.albums.id;
          public               postgres    false    219            �            1259    66108    chats    TABLE     �   CREATE TABLE public.chats (
    id bigint NOT NULL,
    name character varying(256),
    is_group boolean,
    admin_id integer
);
    DROP TABLE public.chats;
       public         heap r       postgres    false            �            1259    66107    chats_id_seq    SEQUENCE     u   CREATE SEQUENCE public.chats_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.chats_id_seq;
       public               postgres    false    222            f           0    0    chats_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.chats_id_seq OWNED BY public.chats.id;
          public               postgres    false    221            �            1259    66087 	   filetypes    TABLE     h   CREATE TABLE public.filetypes (
    id integer NOT NULL,
    typename character varying(55) NOT NULL
);
    DROP TABLE public.filetypes;
       public         heap r       postgres    false            �            1259    66086    filetypes_id_seq    SEQUENCE     �   CREATE SEQUENCE public.filetypes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.filetypes_id_seq;
       public               postgres    false    218            g           0    0    filetypes_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.filetypes_id_seq OWNED BY public.filetypes.id;
          public               postgres    false    217            �            1259    66120    media    TABLE     �   CREATE TABLE public.media (
    id integer NOT NULL,
    path character varying,
    filename character varying(256),
    filetype_id integer,
    album_id integer,
    uploaded_at timestamp with time zone
);
    DROP TABLE public.media;
       public         heap r       postgres    false            �            1259    66119    media_id_seq    SEQUENCE     �   CREATE SEQUENCE public.media_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.media_id_seq;
       public               postgres    false    224            h           0    0    media_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.media_id_seq OWNED BY public.media.id;
          public               postgres    false    223            �            1259    66139    messages    TABLE     �   CREATE TABLE public.messages (
    id integer NOT NULL,
    chat_id bigint,
    sender_id integer,
    content text,
    album_id integer,
    sended_at timestamp with time zone
);
    DROP TABLE public.messages;
       public         heap r       postgres    false            �            1259    66138    messages_id_seq    SEQUENCE     �   CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.messages_id_seq;
       public               postgres    false    226            i           0    0    messages_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;
          public               postgres    false    225            �            1259    66162    rel_users_to_chat    TABLE     e   CREATE TABLE public.rel_users_to_chat (
    user_id integer NOT NULL,
    chat_id bigint NOT NULL
);
 %   DROP TABLE public.rel_users_to_chat;
       public         heap r       postgres    false            �            1259    66074    users    TABLE       CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    hashed_password text NOT NULL,
    email character varying(100) NOT NULL,
    active boolean,
    created_at timestamp with time zone,
    avatar character varying
);
    DROP TABLE public.users;
       public         heap r       postgres    false            �            1259    66073    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    216            j           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    215            �           2604    66099 	   albums id    DEFAULT     f   ALTER TABLE ONLY public.albums ALTER COLUMN id SET DEFAULT nextval('public.albums_id_seq'::regclass);
 8   ALTER TABLE public.albums ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    220    219    220            �           2604    66111    chats id    DEFAULT     d   ALTER TABLE ONLY public.chats ALTER COLUMN id SET DEFAULT nextval('public.chats_id_seq'::regclass);
 7   ALTER TABLE public.chats ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    222    221    222            �           2604    66090    filetypes id    DEFAULT     l   ALTER TABLE ONLY public.filetypes ALTER COLUMN id SET DEFAULT nextval('public.filetypes_id_seq'::regclass);
 ;   ALTER TABLE public.filetypes ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    218    217    218            �           2604    66123    media id    DEFAULT     d   ALTER TABLE ONLY public.media ALTER COLUMN id SET DEFAULT nextval('public.media_id_seq'::regclass);
 7   ALTER TABLE public.media ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    223    224    224            �           2604    66142    messages id    DEFAULT     j   ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);
 :   ALTER TABLE public.messages ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    226    225    226            �           2604    66077    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    215    216    216            W          0    66096    albums 
   TABLE DATA           :   COPY public.albums (id, owner_id, created_at) FROM stdin;
    public               postgres    false    220   F       Y          0    66108    chats 
   TABLE DATA           =   COPY public.chats (id, name, is_group, admin_id) FROM stdin;
    public               postgres    false    222   �F       U          0    66087 	   filetypes 
   TABLE DATA           1   COPY public.filetypes (id, typename) FROM stdin;
    public               postgres    false    218   #G       [          0    66120    media 
   TABLE DATA           W   COPY public.media (id, path, filename, filetype_id, album_id, uploaded_at) FROM stdin;
    public               postgres    false    224   gG       ]          0    66139    messages 
   TABLE DATA           X   COPY public.messages (id, chat_id, sender_id, content, album_id, sended_at) FROM stdin;
    public               postgres    false    226   8J       ^          0    66162    rel_users_to_chat 
   TABLE DATA           =   COPY public.rel_users_to_chat (user_id, chat_id) FROM stdin;
    public               postgres    false    227   �L       S          0    66074    users 
   TABLE DATA           a   COPY public.users (id, username, hashed_password, email, active, created_at, avatar) FROM stdin;
    public               postgres    false    216   �L       k           0    0    albums_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.albums_id_seq', 47, true);
          public               postgres    false    219            l           0    0    chats_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.chats_id_seq', 3, true);
          public               postgres    false    221            m           0    0    filetypes_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.filetypes_id_seq', 6, true);
          public               postgres    false    217            n           0    0    media_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.media_id_seq', 51, true);
          public               postgres    false    223            o           0    0    messages_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.messages_id_seq', 64, true);
          public               postgres    false    225            p           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 3, true);
          public               postgres    false    215            �           2606    66101    albums albums_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.albums DROP CONSTRAINT albums_pkey;
       public                 postgres    false    220            �           2606    66113    chats chats_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.chats DROP CONSTRAINT chats_pkey;
       public                 postgres    false    222            �           2606    66092    filetypes filetypes_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.filetypes
    ADD CONSTRAINT filetypes_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.filetypes DROP CONSTRAINT filetypes_pkey;
       public                 postgres    false    218            �           2606    66094     filetypes filetypes_typename_key 
   CONSTRAINT     _   ALTER TABLE ONLY public.filetypes
    ADD CONSTRAINT filetypes_typename_key UNIQUE (typename);
 J   ALTER TABLE ONLY public.filetypes DROP CONSTRAINT filetypes_typename_key;
       public                 postgres    false    218            �           2606    66127    media media_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.media DROP CONSTRAINT media_pkey;
       public                 postgres    false    224            �           2606    66146    messages messages_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_pkey;
       public                 postgres    false    226            �           2606    66166 (   rel_users_to_chat rel_users_to_chat_pkey 
   CONSTRAINT     t   ALTER TABLE ONLY public.rel_users_to_chat
    ADD CONSTRAINT rel_users_to_chat_pkey PRIMARY KEY (user_id, chat_id);
 R   ALTER TABLE ONLY public.rel_users_to_chat DROP CONSTRAINT rel_users_to_chat_pkey;
       public                 postgres    false    227    227            �           2606    66085    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    216            �           2606    66081    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    216            �           2606    66083    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public                 postgres    false    216            �           2606    66102    albums albums_owner_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.albums
    ADD CONSTRAINT albums_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;
 E   ALTER TABLE ONLY public.albums DROP CONSTRAINT albums_owner_id_fkey;
       public               postgres    false    216    3241    220            �           2606    66114    chats chats_admin_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id) ON DELETE CASCADE;
 C   ALTER TABLE ONLY public.chats DROP CONSTRAINT chats_admin_id_fkey;
       public               postgres    false    216    222    3241            �           2606    66133    media media_album_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id) ON DELETE CASCADE;
 C   ALTER TABLE ONLY public.media DROP CONSTRAINT media_album_id_fkey;
       public               postgres    false    220    3249    224            �           2606    66128    media media_filetype_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.media
    ADD CONSTRAINT media_filetype_id_fkey FOREIGN KEY (filetype_id) REFERENCES public.filetypes(id) ON DELETE CASCADE;
 F   ALTER TABLE ONLY public.media DROP CONSTRAINT media_filetype_id_fkey;
       public               postgres    false    224    3245    218            �           2606    66157    messages messages_album_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_album_id_fkey FOREIGN KEY (album_id) REFERENCES public.albums(id) ON DELETE CASCADE;
 I   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_album_id_fkey;
       public               postgres    false    226    220    3249            �           2606    66147    messages messages_chat_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;
 H   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_chat_id_fkey;
       public               postgres    false    222    3251    226            �           2606    66152     messages messages_sender_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;
 J   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_sender_id_fkey;
       public               postgres    false    226    3241    216            �           2606    66172 0   rel_users_to_chat rel_users_to_chat_chat_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.rel_users_to_chat
    ADD CONSTRAINT rel_users_to_chat_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id) ON DELETE CASCADE;
 Z   ALTER TABLE ONLY public.rel_users_to_chat DROP CONSTRAINT rel_users_to_chat_chat_id_fkey;
       public               postgres    false    3251    222    227            �           2606    66167 0   rel_users_to_chat rel_users_to_chat_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.rel_users_to_chat
    ADD CONSTRAINT rel_users_to_chat_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 Z   ALTER TABLE ONLY public.rel_users_to_chat DROP CONSTRAINT rel_users_to_chat_user_id_fkey;
       public               postgres    false    3241    216    227            W   �   x�u�ˍ�0г]E��Sb-鿎�� ,�*<hF#�hcd;��Q�M %�C��&8S���B�C�iD[�F��C�&�DT`�L�&�L��d�d&;hؔ+h.�(����������w��X��N$�.z_N*%%@ƈy�r���� �@�qU7�?���b�I��[�_X�JV��M�FF��-2��XIuqtמ����ԇe�      Y   !   x�3�,I-.�,�4�2��L�4�2�P1z\\\ `�E      U   4   x�3���*H�2��K�L�2���-0�2	��s�r��s���4�=... S      [   �  x����n�0���S��a�BJ�>|+:`�@;��M�5����ր=C�Fc�`C���i��$%��Z��u�,V����X/'�ꮜn7�e�ٔ�Y����Ҹ���C}_7����#��C��ն��JB�,�A^�ճ��5ʳ�Ȁ3�)bΐsP�Sp��HB� �v&�b-�G�:ȍU ����̀�\Ж��o��S��oi��I��01'u�ƻF#��X�����(nQ���*G >4Tv(*2g����ʾ�"���@�������Z��	v�z�����b��Q�`-��rm#2s�d�{غ;�W����	�Q¨u�,t���bg̵V<�� ��o�;�W��X�(��0�铅W�1�y����n���OC�?]��*	&jN5�@J�d�uka�6;�h�ؠ�4��I��t^H���Q2L��Z'/C֛�]�֋�bUܫ��6�l����e����)���0-�J�0�U˚�3�&!Ӧ�R��Xּ��\���W�C�/O��>�z���[�U�|v����@�8'�qd �y��S�~�#�&B�Hm?O��W�bV���c��c���(�yd����u�߫z��������)Ȍgr��k�!�)\$��}��?,�ն�.�XW�brWE�Qԋ��'7��ۼlB��˰�D��0<f�v�C+��}%~�)�g��޿��h��Xّ      ]   v  x��UKnA]ۧ��]]��H�bǆ,�I�X�"Jl�&aW@H\�@��̍�門L{4���ｮϫ?����ۛ�K�����ڟ�|����;���P �{�g�,ɑ��x`�Ec������!�gP�����R������3�Ô
��a%{p ��z����2f@�)�=R'd��40dR�0�^#LРQ��̥i��T8d�.z �F0EE�0��P,*~�JQaB�5���~��w��Jd.��j��Wwi���Mw=l*e�������{g�N��b=d��R�T�R��e�f2���Fw`���v\��?&,P��!�$c����"�T�i�g]B�D�)�`�`���P("�'���E^.�7��Q��7˗��͋e�WM�J��p�A�E�W���i�i����ٳ����xmȭ�$�5�I�����f��j�eU�l��M�0�d��1�T�*l���d�cA�e�Ef�A�;H�."',��7mO�*�{���T6��z�;s��������������M����+{{�W���M??N1RI��/$��`H��N
��F���I��;�o� H���J��Q��8�D.$�Z�)5�[*і^/�je������Yؾ	)���|��u�      ^      x�3�4�2bcN# m����8F��� 4us      S   3  x���Mn�@ F�p�.\����E�XcT�11#""��3���&mo�#t�]k�0ި��4���{"G��pq^�b�-�>�GfaUw}��ș��Z[��V�݈��~=vQa�(�p�g]� �/�M{��co�}�wv�
FJ[�Q�Cm���q��s����KҴ���x�@�;P�����`FU�Q"��?�@�F�\@"(����Π&�j�(�u�K^��;��-���>O����tM���}�%��1F�����Vs5�F��+wR&;���d�jr(&8�oJ�h\<��W��<�n$��     