import Vapor
import SwiftJWT

let keyID = Environment.get("MAPKIT_KEY_ID")!
let teamID = Environment.get("MAPKIT_KEY_TEAM_ID")!
let origin = Environment.get("MAPKIT_ORIGIN")!
let key = """
-----BEGIN PRIVATE KEY-----
\(Environment.get("MAPKIT_KEY")!)
-----END PRIVATE KEY-----
""".data(using: .utf8)!

class MapKitJSClaims: Claims {
    public init(
        iss: String? = nil,
        exp: Date? = nil,
        iat: Date? = nil,
        origin: String? = nil
    ) {
        self.iss = iss
        self.exp = exp
        self.iat = iat
        self.origin = origin
    }
    
    /**
     The "iss" (issuer) claim identifies the principal that issued the
     JWT.  The processing of this claim is generally application specific.
     The "iss" value is a case-sensitive.
     */
    public var iss: String?
    
    /**
     The "exp" (expiration time) claim identifies the expiration time on
     or after which the JWT MUST NOT be accepted for processing.  The
     processing of the "exp" claim requires that the current date/time
     MUST be before the expiration date/time listed in the "exp" claim.
     Implementers MAY provide for some small leeway, usually no more than
     a few minutes, to account for clock skew.
     */
    public var exp: Date?
    
    /**
     The "iat" (issued at) claim identifies the time at which the JWT was
     issued.  This claim can be used to determine the age of the JWT.
     */
    public var iat: Date?
    
    /**
     
     */
    public var origin: String?
}

public func generateSignedJWTToken() throws -> String {
    guard #available(OSX 10.13, *) else {
        fatalError()
    }
    
    let header = Header(typ: "JWT", kid: keyID)
    let claims = MapKitJSClaims(
        iss: teamID,
        exp: Date(timeIntervalSinceNow: 86400 * 10_000),
        iat: Date(),
        origin: origin
    )
    
    var jwt = JWT(header: header, claims: claims)
    
    return try jwt.sign(using: .es256(privateKey: key))
}

