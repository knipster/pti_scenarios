"""Restricted player pools for the password-shared PTI data.

Shared by tools/pti_share.py (passwords and grants) and tools/pti_share_sync.py
(masking the export). Players in a restricted pool get a placeholder id and a
placeholder name in ratings.csv and matches.csv. Each pool's real ids and names
go in one file encrypted with that pool's key, and a password's key file carries
the keys of the pools it may unlock.

Pools are defined in pti-pools.json next to the secret file:

    {"v": 1, "pools": {
      "NJWPTL-only": {"leagues": ["517"], "rule": "only", "names": "female"},
      "NJWPTL-all":  {"leagues": ["517"], "rule": "ever", "names": "female"}}}

rule "only": every match the player played is in one of the leagues.
rule "ever": at least one match in one of the leagues.
Optional: "label", "include" and "exclude" (lists of player ids), and "names"
("female", "male" or "any", default "any") for the placeholder first names.
"""
import base64
import hashlib
import hmac
import json
import os
import re
import secrets

FEMALE = '''
Abby Abigail Ada Addison Adelaide Adele Adeline Adrienne Agnes Aileen Ainsley Aisling Alana Alba Alessandra
Alexa Alexandra Alice Alicia Alina Alison Allegra Allison Alma Althea Alyssa Amalia Amara Amber Amelia Amy Ana
Anais Anastasia Andrea Angela Angelica Anita Annabel Annette Annie Annika Antoinette Antonia April Arden Ariana
Ariel Arielle Arlene Ashley Aspen Astrid Athena Aubrey Audra Audrey Augusta Aurora Autumn Ava Avery Bailey
Barbara Bea Beatrice Belinda Bella Bernadette Bethany Bettina Betty Beverly Bianca Blair Blanche Blythe Bonnie
Bree Brenda Briana Briar Bridget Brielle Brooke Brynn Caitlin Calista Callie Camila Camille Candace Candice Cara
Carina Carla Carmen Carol Caroline Carys Cassandra Cassidy Catalina Cate Cecilia Celeste Celia Celine Chantal
Charity Charlotte Chelsea Cheryl Chloe Christa Clara Clarissa Claudia Cleo Colette Colleen Constance Cora Coral
Cordelia Corina Corinne Courtney Cressida Cynthia Dahlia Daisy Dana Danielle Daphne Darcy Darlene Deirdre Delia
Delilah Della Delphine Denise Destiny Diana Dinah Dixie Dolores Dominique Dora Doreen Dorothy Eden Edie Edith
Edwina Effie Eileen Elaine Eleanor Elena Elisa Elise Eliza Ella Ellen Ellie Elodie Eloise Elsa Elsie Elvira
Emery Emilia Emma Emmeline Erica Erin Esme Estella Estelle Esther Etta Eugenia Eva Evangeline Evelyn Faith
Fatima Felicity Fern Fiona Flora Florence Frances Francesca Freya Gabriela Gabrielle Gail Gemma Genevieve
Georgia Geraldine Gianna Gillian Gina Ginger Giselle Gladys Glenda Gloria Grace Gracie Greta Gretchen Gwen
Gwendolyn Hadley Hallie Hannah Harper Harriet Hattie Hayley Hazel Heidi Helen Helena Henrietta Hester Hilary
Hollis Holly Hope Ida Ilse Imogen Ines Ingrid Ione Irene Iris Isabel Isadora Isla Ivy Jacqueline Jade Jane
Janelle Janet Janine Jasmine Jean Jeanette Jemima Jenna Jessa Jillian Joan Joanna Jocelyn Jolene Jordana
Josephine Josie Joy Joyce Judith Julia Juliana Juliet June Juniper Justine Kara Kate Katherine Kathleen Katrina
Kay Keira Kelsey Kendra Kerry Kimberly Kinsley Kira Lacey Laila Lana Laney Lara Larissa Laura Laurel Lauren
Lavinia Leah Leanne Leigh Leila Lena Lenora Leona Leslie Lexi Liana Libby Lila Lilah Liliana Lillian Lily Linda
Linnea Lisette Livia Lois Lola Lorelei Lorena Loretta Lorraine Lottie Louisa Lucia Lucille Lucy Lulu Luna Lydia
Lyra Mabel Mackenzie Macy Madeline Madison Mae Maeve Maggie Magnolia Maisie Mallorie Mallory Mara Marcella Marcy
Margaret Margot Marguerite Maria Marianne Marie Marina Marisol Marissa Marjorie Marla Marlene Martha Matilda
Maureen Maxine Maya Meadow Megan Melanie Melinda Melissa Melody Mercedes Meredith Mia Michaela Mila Millicent
Mimi Mina Minerva Miranda Miriam Moira Molly Mona Monica Muriel Nadia Nadine Nancy Naomi Natalia Natasha Nell
Nettie Nina Noelle Noor Nora Norma Octavia Odette Odile Olive Olivia Opal Ophelia Oriana Paige Paloma Pamela
Pandora Patricia Paulette Pearl Peggy Penelope Petra Philippa Phoebe Phyllis Piper Polly Poppy Posy Priscilla
Quinn Rachel Rae Raquel Rebecca Reese Regina Renata Renee Rhea Rhoda Rita Roberta Romy Rosa Rosalie Rosalind
Rosemary Rosie Rowena Roxanne Ruby Ruth Sabine Sabrina Sadie Sage Salome Samara Sara Sarah Sasha Savannah
Scarlett Selena Seraphina Serena Shannon Shea Sheila Shelby Sidney Sienna Simone Sky Sloane Sofia Sondra Sonia
Sophie Stella Stephanie Susanna Suzette Sybil Sylvia Tabitha Talia Tallulah Tamara Tara Tatiana Teresa Tessa
Thea Theodora Thora Tiffany Tilda Tina Trudy Una Ursula Valentina Valerie Vanessa Vera Verity Veronica Vicky
Vida Viola Violet Virginia Vivian Wanda Wendy Whitney Willa Winifred Winona Wren Xena Yasmin Yolanda Yvette
Yvonne Zara Zelda Zinnia Zoe Zora
'''.split()

MALE = '''
Aaron Abel Adrian Alden Alistair Ambrose Amos Anders Angus Ansel Archer Arlo Arthur Asher August Barrett Basil
Beckett Benedict Bennett Bernard Blaine Boris Bram Brendan Brooks Bruno Byron Cal Callum Calvin Cameron Carlton
Casper Cecil Cedric Chester Clark Clayton Clement Clifford Cole Conrad Cormac Cyrus Dalton Damon Dashiell Declan
Desmond Dexter Donovan Dorian Duncan Easton Edgar Edmund Elias Elliot Emil Emmett Ernest Ezra Felix Fergus
Fletcher Floyd Forrest Gage Garrett Gideon Gilbert Graham Grady Griffin Gus Hal Harlan Harvey Hayes Hector
Holden Horace Hugo Ian Ignatius Ira Irving Isaac Jasper Jethro Jonah Jude Julian Keegan Kendrick Lachlan Lance
Leander Leopold Lincoln Lionel Lowell Lucas Lyle Malcolm Marshall Maxwell Milo Monroe Montgomery Morgan Murray
Nash Nathaniel Neville Nolan Oren Orson Oscar Otis Otto Pierce Quentin Quincy Raphael Reid Remy Rhett Roland
Roscoe Rufus Rupert Sawyer Silas Simon Sterling Stuart Sullivan Tobias Truman Tucker Ulysses Vance Victor Wade
Walker Warren Wesley Whit Wilder Winston Wyatt Zane
'''.split()

LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
B32 = 'abcdefghjkmnpqrstuvwxyz23456789'  # no look-alikes, as in pti_share.py's passphrases


def b64(b):
    return base64.b64encode(b).decode()


def unb64(s):
    return base64.b64decode(s)


def pools_path(secret_path, given=None):
    return given or os.path.join(os.path.dirname(os.path.abspath(secret_path)), 'pti-pools.json')


def load_config(path):
    """The pool definitions, or None if there is no pools file, it is empty or it lists no pools."""
    if not path or not os.path.exists(path):
        return None
    with open(path) as fh:
        text = fh.read()
    if not text.strip():
        return None  # an empty file means no pools
    pools = json.loads(text).get('pools')
    if not pools:
        return None
    if not isinstance(pools, dict):
        raise ValueError(path + ' needs a "pools" object')
    for name, p in pools.items():
        if not re.fullmatch(r'[A-Za-z0-9_.-]{1,40}', name) or name == 'all':
            raise ValueError(f'pool name "{name}" must be letters, digits, ".", "_" or "-", and not "all"')
        if not p.get('leagues') or not isinstance(p['leagues'], list):
            raise ValueError(f'pool {name} needs a "leagues" list')
        p['leagues'] = [str(x) for x in p['leagues']]
        if p.get('rule', 'only') not in ('only', 'ever'):
            raise ValueError(f'pool {name}: rule must be "only" or "ever"')
        if p.get('names', 'any') not in ('female', 'male', 'any'):
            raise ValueError(f'pool {name}: names must be "female", "male" or "any"')
        p['include'] = {str(x) for x in p.get('include', [])}
        p['exclude'] = {str(x) for x in p.get('exclude', [])}
    return pools


def members(pools, leagues_by_player):
    """{pool: set of player ids}, from each player's set of leagues over the whole table."""
    out = {}
    for name, p in pools.items():
        ls, only = set(p['leagues']), p.get('rule', 'only') == 'only'
        ids = {pid for pid, lgs in leagues_by_player.items() if (lgs <= ls if only else lgs & ls)}
        out[name] = (ids | p['include']) - p['exclude']
    return out


def short_name(name):
    """('avery', 'H') for "Avery Hale", the form placeholders must not share with a real player."""
    words = re.findall(r"[^\W\d_][^\W\d_'’.-]*", name or '')
    if len(words) < 2:
        return None
    return words[0].lower(), words[-1][0].upper()


class Placeholders:
    """Stable placeholder ids and names, keyed by the secret's placeholder key."""

    def __init__(self, key, real_names):
        self.key = key
        self.taken = {short_name(n) for n in real_names} - {None}
        self.ids, self.used = set(), set()

    def _h(self, *parts):
        return hmac.new(self.key, '|'.join(parts).encode(), hashlib.sha256).digest()

    def make(self, real_id, style='any'):
        firsts = FEMALE if style == 'female' else MALE if style == 'male' else FEMALE + MALE
        for c in range(1000):
            h = self._h('id', real_id, str(c))
            pid = 'x-' + ''.join(B32[b % len(B32)] for b in h[:8])
            if pid not in self.ids:
                break
        for c in range(10000):
            h = self._h('name', real_id, str(c))
            first = firsts[int.from_bytes(h[:4], 'big') % len(firsts)]
            short = (first.lower(), LETTERS[h[4] % 26])
            if short not in self.taken and short not in self.used:
                break
        else:
            raise RuntimeError('ran out of placeholder names; add first names to tools/pti_pools.py')
        self.ids.add(pid)
        self.used.add(short)
        return pid, f'{first} {short[1]}.'


# ---------- Keys in the secret file ----------
# s['pools'] = {name: {'key': b64, 'rotate': bool}}; s['placeholderKey'] = b64
# each password: {'label', 'file', 'added', 'wrap': b64 (its key-file key), 'pools': [names] or 'all'}

def placeholder_key(s):
    if not s.get('placeholderKey'):
        s['placeholderKey'] = b64(secrets.token_bytes(32))
    return unb64(s['placeholderKey'])


def ensure_pool(s, name):
    s.setdefault('pools', {})
    if name not in s['pools']:
        s['pools'][name] = {'key': b64(secrets.token_bytes(32))}
    return s['pools'][name]


def granted(s, pw):
    have = s.get('pools', {})
    want = list(have) if pw.get('pools') == 'all' else (pw.get('pools') or [])
    return {n: have[n]['key'] for n in want if n in have}


def key_file(s, pw):
    """The plain key file of a password: what its passphrase unlocks."""
    return json.dumps({'v': 2, 'key': s['dataKey'], 'm': s['manifest'], 'pools': granted(s, pw)},
                      separators=(',', ':')).encode()


def mark_rotation(s, names):
    for n in names:
        if n in s.get('pools', {}):
            s['pools'][n]['rotate'] = True
