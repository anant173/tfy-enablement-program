// Reference to user/session definitions from tfy-llm-gateway
// The Session interface is defined at: ~/work/repos/tfy-llm-gateway/src/services/AuthenticationService.ts
// Session interface includes: subjectId, tenantName, subjectSlug, subjectType, teams
// User class is defined at: ~/work/repos/tfy-llm-gateway/src/entities/User.ts
// For now, we extract subjectId from the decoded JWT token without verification (temporary setting)

/**
 * Server call context for A2A requests
 */
export class ServerCallContext {
  readonly requestedExtensions: Set<string>;
  readonly activatedExtensions: Set<string>;
  readonly agentId: string;
  readonly userSession: UserSession;
  
  constructor(requestedExtensions: Set<string>, agentId: string, userSession: UserSession) {
    this.requestedExtensions = requestedExtensions;
    this.activatedExtensions = new Set<string>();
    this.agentId = agentId;
    this.userSession = new UserSession(userSession.id, userSession.token, userSession.subjectId);
  }
}

export class UserSession {
    readonly id: string;
    readonly token: string;
    readonly subjectId: string;

    constructor(id: string, token: string, subjectId: string) {
        this.id = id;
        this.token = token;
        this.subjectId = subjectId;
    }
}


