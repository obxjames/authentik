import { DEFAULT_CONFIG } from "@goauthentik/web/api/Config";
import { me } from "@goauthentik/web/api/Users";
import { EVENT_REFRESH } from "@goauthentik/web/constants";
import "@goauthentik/web/elements/CodeMirror";
import "@goauthentik/web/elements/Tabs";
import "@goauthentik/web/elements/buttons/ModalButton";
import "@goauthentik/web/elements/buttons/SpinnerButton";
import "@goauthentik/web/elements/events/ObjectChangelog";
import "@goauthentik/web/pages/providers/RelatedApplicationButton";
import "@goauthentik/web/pages/providers/ldap/LDAPProviderForm";

import { t } from "@lingui/macro";

import { CSSResult, LitElement, TemplateResult, html } from "lit";
import { until } from "lit-html/directives/until.js";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import AKGlobal from "@goauthentik/web/authentik.css";
import PFBanner from "@patternfly/patternfly/components/Banner/banner.css";
import PFButton from "@patternfly/patternfly/components/Button/button.css";
import PFCard from "@patternfly/patternfly/components/Card/card.css";
import PFContent from "@patternfly/patternfly/components/Content/content.css";
import PFDescriptionList from "@patternfly/patternfly/components/DescriptionList/description-list.css";
import PFForm from "@patternfly/patternfly/components/Form/form.css";
import PFFormControl from "@patternfly/patternfly/components/FormControl/form-control.css";
import PFList from "@patternfly/patternfly/components/List/list.css";
import PFPage from "@patternfly/patternfly/components/Page/page.css";
import PFGrid from "@patternfly/patternfly/layouts/Grid/grid.css";
import PFBase from "@patternfly/patternfly/patternfly-base.css";

import { LDAPProvider, ProvidersApi } from "@goauthentik/api";

@customElement("ak-provider-ldap-view")
export class LDAPProviderViewPage extends LitElement {
    @property()
    set args(value: { [key: string]: number }) {
        this.providerID = value.id;
    }

    @property({ type: Number })
    set providerID(value: number) {
        new ProvidersApi(DEFAULT_CONFIG)
            .providersLdapRetrieve({
                id: value,
            })
            .then((prov) => (this.provider = prov));
    }

    @property({ attribute: false })
    provider?: LDAPProvider;

    static get styles(): CSSResult[] {
        return [
            PFBase,
            PFButton,
            PFBanner,
            PFForm,
            PFFormControl,
            PFList,
            PFGrid,
            PFPage,
            PFContent,
            PFCard,
            PFDescriptionList,
            AKGlobal,
        ];
    }

    constructor() {
        super();
        this.addEventListener(EVENT_REFRESH, () => {
            if (!this.provider?.pk) return;
            this.providerID = this.provider?.pk;
        });
    }

    render(): TemplateResult {
        if (!this.provider) {
            return html``;
        }
        return html`${
            this.provider?.assignedApplicationName
                ? html``
                : html`<div slot="header" class="pf-c-banner pf-m-warning">
                      ${t`Warning: Provider is not used by an Application.`}
                  </div>`
        }
            ${
                this.provider?.outpostSet.length < 1
                    ? html`<div slot="header" class="pf-c-banner pf-m-warning">
                          ${t`Warning: Provider is not used by any Outpost.`}
                      </div>`
                    : html``
            }
            <div class="pf-c-page__main-section pf-m-no-padding-mobile pf-l-grid pf-m-gutter">
                <div class="pf-c-card pf-l-grid__item pf-m-12-col">
                    <div class="pf-c-card__body">
                        <dl class="pf-c-description-list pf-m-3-col-on-lg">
                            <div class="pf-c-description-list__group">
                                <dt class="pf-c-description-list__term">
                                    <span class="pf-c-description-list__text">${t`Name`}</span>
                                </dt>
                                <dd class="pf-c-description-list__description">
                                    <div class="pf-c-description-list__text">
                                        ${this.provider.name}
                                    </div>
                                </dd>
                            </div>
                            <div class="pf-c-description-list__group">
                                <dt class="pf-c-description-list__term">
                                    <span class="pf-c-description-list__text"
                                        >${t`Assigned to application`}</span
                                    >
                                </dt>
                                <dd class="pf-c-description-list__description">
                                    <div class="pf-c-description-list__text">
                                        <ak-provider-related-application
                                            .provider=${this.provider}
                                        ></ak-provider-related-application>
                                    </div>
                                </dd>
                            </div>
                            <div class="pf-c-description-list__group">
                                <dt class="pf-c-description-list__term">
                                    <span class="pf-c-description-list__text"
                                        >${t`Base DN`}</span
                                    >
                                </dt>
                                <dd class="pf-c-description-list__description">
                                    <div class="pf-c-description-list__text">
                                        ${this.provider.baseDn}
                                    </div>
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <div class="pf-c-card__footer">
                        <ak-forms-modal>
                            <span slot="submit"> ${t`Update`} </span>
                            <span slot="header"> ${t`Update LDAP Provider`} </span>
                            <ak-provider-ldap-form slot="form" .instancePk=${this.provider.pk}>
                            </ak-provider-ldap-form>
                            <button slot="trigger" class="pf-c-button pf-m-primary">
                                ${t`Edit`}
                            </button>
                        </ak-forms-modal>
                    </div>
                </div>
                <div class="pf-c-card pf-l-grid__item pf-m-12-col">
                    <div class="pf-c-card__title">
                        ${t`How to connect`}
                    </div>
                    <div class="pf-c-card__body">
                        <p>
                            ${t`Connect to the LDAP Server on port 389:`}
                        </p>
                        <ul class="pf-c-list">
                            <li>${t`Check the IP of the Kubernetes service, or`}</li>
                            <li>${t`The Host IP of the docker host`}</li>
                        </ul>
                        <form class="pf-c-form">
                            <div class="pf-c-form__group">
                                <label class="pf-c-form__label">
                                    <span class="pf-c-form__label-text">${t`Bind DN`}</span>
                                </label>
                                <!-- @ts-ignore -->
                                <input
                                    class="pf-c-form-control"
                                    readonly
                                    type="text"
                                    value=${until(
                                        me().then((m) => {
                                            return `cn=${
                                                m.user.username
                                            },ou=users,${this.provider?.baseDn?.toLowerCase()}`;
                                        }),
                                    )}
                                />
                            </div>
                            <div class="pf-c-form__group">
                                <label class="pf-c-form__label">
                                    <span class="pf-c-form__label-text">${t`Bind Password`}</span>
                                </label>
                                <input
                                    class="pf-c-form-control"
                                    readonly
                                    type="text"
                                    value="Your authentik password"
                                />
                            </div>
                            <div class="pf-c-form__group">
                                <label class="pf-c-form__label">
                                    <span class="pf-c-form__label-text">${t`Search base`}</span>
                                </label>
                                <input
                                    class="pf-c-form-control"
                                    readonly
                                    type="text"
                                    value=${ifDefined(this.provider?.baseDn?.toLowerCase())}
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>`;
    }
}
