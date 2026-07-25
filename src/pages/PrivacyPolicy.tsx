import type { FC } from 'react';
import Page from 'src/pages/Page';
import './privacy-policy.css';

const PrivacyPolicyContents: FC = () => (
    <ol className="privacy-policy-toc__list">
        <li><a href="#information-we-collect">Information We Collect</a></li>
        <li><a href="#how-we-use-information">How We Use Information</a></li>
        <li><a href="#google-user-data">Google User Data</a></li>
        <li><a href="#artificial-intelligence">Artificial Intelligence</a></li>
        <li><a href="#third-party-services">Third-Party Services</a></li>
        <li><a href="#cookies-and-local-storage">Cookies and Local Storage</a></li>
        <li><a href="#data-retention">Data Retention</a></li>
        <li><a href="#account-deletion">Account Deletion</a></li>
        <li><a href="#data-security">Data Security</a></li>
        <li><a href="#oauth-token-storage">OAuth Token Storage</a></li>
        <li>
            <a href="#your-privacy-rights">Your Privacy Rights</a>
            <ol>
                <li><a href="#eea-uk-switzerland">EEA, United Kingdom, and Switzerland</a></li>
                <li><a href="#california-residents">California Residents</a></li>
            </ol>
        </li>
        <li><a href="#international-data-transfers">International Data Transfers</a></li>
        <li><a href="#childrens-privacy">Children's Privacy</a></li>
        <li><a href="#legal-basis-for-processing">Legal Basis for Processing</a></li>
        <li><a href="#changes-to-this-privacy-policy">Changes to This Privacy Policy</a></li>
        <li><a href="#contact">Contact</a></li>
    </ol>
);

const PrivacyPolicyPage: FC = () => {
    return (
        <Page privacyLink={false}>
            <article className="privacy-policy-page">
                <header className="privacy-policy-header">
                    <p className="privacy-policy-eyebrow">Legal</p>
                    <h1>Privacy Policy</h1>
                    <p className="privacy-policy-updated">
                        <span>Last updated</span>
                        <time dateTime="2026-07-25">July 25, 2026</time>
                    </p>
                    <p className="privacy-policy-intro">
                        Daily Reset List ("Daily Reset List," "the App," "we," "our," or "us")
                        values your privacy. This Privacy Policy explains what information
                        we collect, how we use it, and the choices available to you
                        when using Daily Reset List.
                    </p>
                </header>

                <div className="privacy-policy-layout">
                    <aside className="privacy-policy-toc privacy-policy-toc--desktop">
                        <p className="privacy-policy-toc__title">On this page</p>
                        <nav aria-label="Table of contents">
                            <PrivacyPolicyContents />
                        </nav>
                    </aside>
                    <details className="privacy-policy-toc privacy-policy-toc--mobile">
                        <summary>On this page</summary>
                        <nav aria-label="Table of contents">
                            <PrivacyPolicyContents />
                        </nav>
                    </details>

                    <div className="privacy-policy-content">
                        <h2 id="information-we-collect">Information We Collect</h2>
                        <h3>Account Information</h3>
                        <p>When you sign in using Google Authentication, we may collect information provided by Google, including:</p>
                        <ul>
                            <li>Name</li>
                            <li>Email address</li>
                            <li>Google account identifier</li>
                            <li>Profile picture, if available</li>
                        </ul>
                        <p>This information is used to create and manage your account.</p>

                        <h3>Tasks and Productivity Data</h3>
                        <p>When you use Daily Reset List, we store information you create, including:</p>
                        <ul>
                            <li>Tasks</li>
                            <li>Categories</li>
                            <li>Notes</li>
                            <li>Scheduling and recurrence settings</li>
                            <li>Task completion history</li>
                            <li>Application preferences and settings</li>
                        </ul>

                        <h3>Journal Entries</h3>
                        <p>If you use the journaling features, we store the journal entries and content you create.</p>
                        <p>
                            Journal entry text is <strong>not end-to-end encrypted by default</strong>. Unless you enable the
                            Private Journal feature and encryption has completed, journal text stored on Daily Reset List
                            servers may be accessed by the developer when reasonably necessary to provide technical support,
                            investigate bugs, maintain service reliability, comply with legal obligations, or protect the
                            security of the service.
                        </p>
                        <p>
                            If you enable Private Journal, journal entry text is encrypted in your browser before it is sent
                            to Daily Reset List. After encryption is complete, the servers store the encrypted text and Daily
                            Reset List cannot read it without your encryption password or recovery key. Existing entries remain
                            readable by the service until they have been encrypted, and removing Private Journal encryption
                            makes the journal text readable by the service again. This encryption applies to journal entry text;
                            associated information such as entry dates and identifiers is still stored by the service.
                        </p>

                        <h3>Google Calendar Data</h3>
                        <p>If you choose to connect your Google Calendar account, Daily Reset List may access calendar information that you authorize.</p>
                        <p>Depending on the features you use, Daily Reset List may:</p>
                        <ul>
                            <li>Read calendar events</li>
                            <li>Create calendar events</li>
                            <li>Update calendar events</li>
                            <li>Delete calendar events</li>
                        </ul>
                        <p>This access is used solely to provide calendar integration features requested by you.</p>

                        <h3>Technical Information</h3>
                        <p>To operate and secure the service, we may automatically collect limited technical information, including:</p>
                        <ul>
                            <li>Browser type and version</li>
                            <li>Device information</li>
                            <li>Operating system</li>
                            <li>IP address</li>
                            <li>Authentication and security logs</li>
                            <li>Diagnostic information necessary to maintain service reliability</li>
                        </ul>

                        <h2 id="how-we-use-information">How We Use Information</h2>
                        <p>We use information to:</p>
                        <ul>
                            <li>Provide and maintain Daily Reset List</li>
                            <li>Authenticate users</li>
                            <li>Store tasks, notes, and journal entries</li>
                            <li>Synchronize information with Google Calendar when enabled</li>
                            <li>Save user preferences and settings</li>
                            <li>Improve reliability, performance, and security</li>
                            <li>Respond to support requests</li>
                            <li>Detect and prevent abuse, fraud, or unauthorized access</li>
                            <li>Comply with legal obligations</li>
                        </ul>

                        <h2 id="google-user-data">Google User Data</h2>
                        <p>If you connect Google Calendar:</p>
                        <ul>
                            <li>We only request permissions necessary to provide calendar integration features.</li>
                            <li>We only access Google Calendar data that you authorize us to access.</li>
                            <li>We do not sell Google user data.</li>
                            <li>We do not use Google user data for advertising purposes.</li>
                            <li>We do not share Google user data except as necessary to provide requested functionality or comply with legal obligations.</li>
                            <li>Google Workspace APIs are not used to develop, improve, or train generalized artificial intelligence or machine learning models.</li>
                        </ul>
                        <p>You may revoke Google Calendar access at any time through your Google Account permissions settings.</p>

                        <h2 id="artificial-intelligence">Artificial Intelligence</h2>
                        <p>Daily Reset List does not use user-generated content, including tasks, notes, or journal entries, to train artificial intelligence or machine learning models.</p>

                        <h2 id="third-party-services">Third-Party Services</h2>
                        <p>Daily Reset List relies on third-party providers to operate certain features, including:</p>
                        <ul>
                            <li>Google Authentication</li>
                            <li>Google Calendar</li>
                            <li>Railway hosting infrastructure</li>
                        </ul>
                        <p>These providers may process information as necessary to provide their services and are governed by their own privacy policies.</p>

                        <h2 id="cookies-and-local-storage">Cookies and Local Storage</h2>
                        <p>Daily Reset List may use cookies, local storage, session storage, or similar technologies to:</p>
                        <ul>
                            <li>Maintain login sessions</li>
                            <li>Save preferences and settings</li>
                            <li>Improve application performance</li>
                            <li>Provide core application functionality</li>
                        </ul>
                        <p>These technologies are not used to sell personal information or track users across unrelated websites.</p>

                        <h2 id="data-retention">Data Retention</h2>
                        <p>We retain information only as long as necessary to:</p>
                        <ul>
                            <li>Provide the service</li>
                            <li>Maintain account functionality</li>
                            <li>Comply with legal obligations</li>
                            <li>Resolve disputes</li>
                            <li>Enforce agreements</li>
                        </ul>
                        <p>Daily Reset List does not maintain separate long-term database backups. Deleted information is generally removed from active systems and is not retained for restoration purposes.</p>

                        <h2 id="account-deletion">Account Deletion</h2>
                        <p>Users may delete their account through the Settings page.</p>
                        <p>When an account is deleted, associated account data is removed from Daily Reset List's active systems, subject to any legal obligations requiring retention.</p>
                        <p>Deleting your account removes your account information, tasks, notes, journal entries, application settings, and stored Google Calendar authorization tokens associated with your account.</p>
                        <h2 id="data-security">Data Security</h2>
                        <p>We implement reasonable administrative and technical safeguards designed to protect personal information.</p>
                        <p>However, no method of electronic transmission or storage is completely secure, and we cannot guarantee absolute security.</p>
                        <h2 id="oauth-token-storage">OAuth Token Storage</h2>
                        <p>When you connect Google Calendar, Daily Reset List stores OAuth access tokens and refresh tokens provided by Google. These tokens are used solely to maintain your connection to Google Calendar and provide calendar synchronization features.</p>
                        <h2 id="your-privacy-rights">Your Privacy Rights</h2>
                        <h3 id="eea-uk-switzerland">European Economic Area, United Kingdom, and Switzerland</h3>
                        <p>If you are located in the EEA, United Kingdom, or Switzerland, you may have rights under applicable data protection laws, including the right to:</p>
                        <ul>
                            <li>Access your personal information</li>
                            <li>Correct inaccurate information</li>
                            <li>Request deletion of personal information</li>
                            <li>Restrict or object to certain processing activities</li>
                            <li>Withdraw consent where consent is the legal basis for processing</li>
                            <li>Request a copy of personal information we hold about you, where required by law</li>
                        </ul>
                        <p>You may also lodge a complaint with your local data protection authority.</p>

                        <h3 id="california-residents">California Residents</h3>
                        <p>If you are a California resident, you may have rights under the California Consumer Privacy Act and California Privacy Rights Act, including the right to:</p>
                        <ul>
                            <li>Know what personal information is collected</li>
                            <li>Access personal information</li>
                            <li>Request deletion of personal information</li>
                            <li>Request correction of inaccurate personal information</li>
                            <li>Receive equal service regardless of exercising privacy rights</li>
                        </ul>
                        <p>Daily Reset List does not sell personal information and does not share personal information for cross-context behavioral advertising.</p>

                        <h2 id="international-data-transfers">International Data Transfers</h2>
                        <p>Your information may be processed and stored in the United States and other countries where our service providers operate.</p>
                        <p>By using  Daily Reset List, you acknowledge that your information may be transferred to and processed in countries outside your country of residence.</p>

                        <h2 id="childrens-privacy">Children's Privacy</h2>
                        <p>Daily Reset List is intended for users who are at least 13 years old.</p>
                        <p>We do not knowingly collect personal information from children under 13. If you believe a child has provided personal information to Daily Reset List, please contact us and we will take reasonable steps to delete that information.</p>

                        <h2 id="legal-basis-for-processing">Legal Basis for Processing</h2>
                        <p>For users located in the European Economic Area, United Kingdom, or Switzerland, personal information is processed under one or more of the following legal bases:</p>
                        <ul>
                            <li>Performance of a contract</li>
                            <li>User consent</li>
                            <li>Compliance with legal obligations</li>
                            <li>Legitimate interests in operating, securing, and improving Daily Reset List</li>
                        </ul>
                        <p>For purposes of applicable data protection laws, Elise Straub is the data controller for personal information collected through Daily Reset List.</p>

                        <h2 id="changes-to-this-privacy-policy">Changes to This Privacy Policy</h2>
                        <p>We may update this Privacy Policy from time to time.</p>
                        <p>Any changes will be posted on this page with an updated Last Updated date. Continued use of Daily Reset List after changes become effective constitutes acceptance of the revised Privacy Policy.</p>

                        <h2 id="contact">Contact</h2>
                        <p>Daily Reset List is operated by Elise Straub. If you have questions about this Privacy Policy or wish to exercise your privacy rights, please contact:</p>
                        <p>
                            <a href="mailto:elise.straub.dev+dailyreset@gmail.com">
                                elise.straub.dev+dailyreset@gmail.com
                            </a>
                        </p>
                    </div>
                </div>
            </article>
        </Page>
    );
};

export default PrivacyPolicyPage;
