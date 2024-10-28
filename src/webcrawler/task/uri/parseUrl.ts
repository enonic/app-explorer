// Dividers
// ://
// :
// /
// ?
// #
// Not allowed in host
// [^:/?#]
// Colon is allowed in path
// [^?#]

// Optional Scheme (?:([a-zA-Z][a-zA-Z0-9+.-]+)?:\/\/)?
// Optional Userinfo (?:((?:[A-Za-z0-9-_.!~*'();:&=+$,]|%[0-9A-Fa-f]{2})*)@)?
// Optional Host ([^:/?#]+)?
// Optional Port (?::(\d+))?
// Optional Path ([^?#]+)?
// Optional Query (?:\?([^#]*))?
// Optional Fragment (?:#(.*))?

const REGEX = /^(?:([a-zA-Z][a-zA-Z0-9+.-]+)?:\/\/)?(?:((?:[A-Za-z0-9-_.!~*'();:&=+$,]|%[0-9A-Fa-f]{2})*)@)?([^:/?#]+)?(?::(\d+))?([^?#]+)?(?:\?([^#]*))?(?:#(.*))?$/;

export function parseUrl(url: string): {
	scheme: string
	userinfo: string
	host: string
	port: string
	path: string
	query: string
	fragment: string
} {
	const [
		_match,
		scheme,
		userinfo,
		host,
		port,
		path,
		query,
		fragment
	] = url.match(REGEX);
	// console.debug({
	// 	_match,
	// 	scheme,
	// 	userinfo,
	// 	host,
	// 	port,
	// 	path,
	// 	query,
	// 	fragment
	// });
	return {
		scheme,
		userinfo,
		host,
		port,
		path,
		query,
		fragment
	};
}

const REGEX_ALPHANUM = /[A-Za-z0-9]/;
const REGEX_MARK = /[-_.!~*'()]/;
const REGEX_UNRESERVED = /[A-Za-z0-9-_.!~*'()]/;
const REGEX_HEX = /[0-9A-Fa-f]/;
const REGEX_ESCAPED = /%[0-9A-Fa-f]{2}/;
const REGEX_USER_INFO = /([A-Za-z0-9-_.!~*'();:&=+$,]|%[0-9A-Fa-f]{2})*@/;

/*

https://www.rfc-editor.org/rfc/rfc2396.html

2.3. Unreserved Characters

   Data characters that are allowed in a URI but do not have a reserved
   purpose are called unreserved.  These include upper and lower case
   letters, decimal digits, and a limited set of punctuation marks and
   symbols.

      unreserved  = alphanum | mark

      mark        = "-" | "_" | "." | "!" | "~" | "*" | "'" | "(" | ")"

   Unreserved characters can be escaped without changing the semantics
   of the URI, but this should not be done unless the URI is being used
   in a context that does not allow the unescaped character to appear.

   2.4. Escape Sequences

   Data must be escaped if it does not have a representation using an
   unreserved character; this includes data that does not correspond to
   a printable character of the US-ASCII coded character set, or that
   corresponds to any US-ASCII character that is disallowed, as
   explained below.

2.4.1. Escaped Encoding

   An escaped octet is encoded as a character triplet, consisting of the
   percent character "%" followed by the two hexadecimal digits
   representing the octet code. For example, "%20" is the escaped
   encoding for the US-ASCII space character.

      escaped     = "%" hex hex
      hex         = digit | "A" | "B" | "C" | "D" | "E" | "F" |
                            "a" | "b" | "c" | "d" | "e" | "f"

3.1 Scheme Component

   Just as there are many different methods of access to resources,
   there are a variety of schemes for identifying such resources.  The
   URI syntax consists of a sequence of components separated by reserved
   characters, with the first component defining the semantics for the
   remainder of the URI string.

   Scheme names consist of a sequence of characters beginning with a
   lower case letter and followed by any combination of lower case
   letters, digits, plus ("+"), period ("."), or hyphen ("-").  For
   resiliency, programs interpreting URI should treat upper case letters
   as equivalent to lower case in scheme names (e.g., allow "HTTP" as
   well as "http").

      scheme        = alpha *( alpha | digit | "+" | "-" | "." )

3.2.2. Server-based Naming Authority

   URL schemes that involve the direct use of an IP-based protocol to a
   specified server on the Internet use a common syntax for the server
   component of the URI's scheme-specific data:

      <userinfo>@<host>:<port>

   where <userinfo> may consist of a user name and, optionally, scheme-
   specific information about how to gain authorization to access the
   server.  The parts "<userinfo>@" and ":<port>" may be omitted.

      server        = [ [ userinfo "@" ] hostport ]

   The user information, if present, is followed by a commercial at-sign
   "@".

      userinfo      = *( unreserved | escaped |
                         ";" | ":" | "&" | "=" | "+" | "$" | "," )

   Some URL schemes use the format "user:password" in the userinfo
   field. This practice is NOT RECOMMENDED, because the passing of
   authentication information in clear text (such as URI) has proven to
   be a security risk in almost every case where it has been used.

   The host is a domain name of a network host, or its IPv4 address as a
   set of four decimal digit groups separated by ".".  Literal IPv6
   addresses are not supported.

      hostport      = host [ ":" port ]
      host          = hostname | IPv4address
      hostname      = *( domainlabel "." ) toplabel [ "." ]
      domainlabel   = alphanum | alphanum *( alphanum | "-" ) alphanum
      toplabel      = alpha | alpha *( alphanum | "-" ) alphanum



Berners-Lee, et. al.        Standards Track                    [Page 13]

RFC 2396                   URI Generic Syntax                August 1998


      IPv4address   = 1*digit "." 1*digit "." 1*digit "." 1*digit
      port          = *digit

   Hostnames take the form described in Section 3 of [RFC1034] and
   Section 2.1 of [RFC1123]: a sequence of domain labels separated by
   ".", each domain label starting and ending with an alphanumeric
   character and possibly also containing "-" characters.  The rightmost
   domain label of a fully qualified domain name will never start with a
   digit, thus syntactically distinguishing domain names from IPv4
   addresses, and may be followed by a single "." if it is necessary to
   distinguish between the complete domain name and any local domain.
   To actually be "Uniform" as a resource locator, a URL hostname should
   be a fully qualified domain name.  In practice, however, the host
   component may be a local domain literal.

      Note: A suitable representation for including a literal IPv6
      address as the host part of a URL is desired, but has not yet been
      determined or implemented in practice.

   The port is the network port number for the server.  Most schemes
   designate protocols that have a default port number.  Another port
   number may optionally be supplied, in decimal, separated from the
   host by a colon.  If the port is omitted, the default port number is
   assumed.

*/
