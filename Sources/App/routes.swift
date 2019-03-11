import Vapor
import SwiftJWT

public func routes(_ router: Router) throws {
    router.get { req in
        return try req.view().render("map")
    }

    router.get("token") { req -> String in
        return try generateSignedJWTToken()
    }
}
