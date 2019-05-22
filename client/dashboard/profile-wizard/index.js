/** @format */
/**
 * External dependencies
 */
import apiFetch from '@wordpress/api-fetch';
import { Component, createElement } from '@wordpress/element';
import { compose } from '@wordpress/compose';
import { withDispatch } from '@wordpress/data';

/**
 * WooCommerce dependencies
 */
import { stringifyQuery, updateQueryString } from '@woocommerce/navigation';

/**
 * Internal depdencies
 */
import Plugins from './steps/plugins';
import Start from './steps/start/';
import './style.scss';

const getSteps = () => {
	const steps = [];

	steps.push( {
		key: 'start',
		container: Start,
	} );
	steps.push( {
		key: 'plugins',
		container: Plugins,
	} );

	return steps;
};

class ProfileWizard extends Component {
	constructor() {
		super( ...arguments );
		this.goToNextStep = this.goToNextStep.bind( this );
		this.updateProfile = this.updateProfile.bind( this );
	}

	componentDidMount() {
		document.documentElement.classList.remove( 'wp-toolbar' );
		document.body.classList.add( 'woocommerce-profile-wizard__body' );
	}

	componentWillUnmount() {
		document.documentElement.classList.add( 'wp-toolbar' );
		document.body.classList.remove( 'woocommerce-profile-wizard__body' );
	}

	getCurrentStep() {
		const { step } = this.props.query;
		const currentStep = getSteps().find( s => s.key === step );

		if ( ! currentStep ) {
			return getSteps()[ 0 ];
		}

		return currentStep;
	}

	goToNextStep() {
		const currentStep = this.getCurrentStep();
		const currentStepIndex = getSteps().findIndex( s => s.key === currentStep.key );
		const nextStep = getSteps()[ currentStepIndex + 1 ];

		if ( 'undefined' === nextStep ) {
			this.updateProfile( { complete: true } );
		}

		return updateQueryString( { step: nextStep.key } );
	}

	updateProfile( params ) {
		const { addNotice } = this.props;
		const payload = stringifyQuery( params );

		return apiFetch( {
			path: `/wc-admin/v1/onboarding/profile${ payload }`,
			method: 'POST',
		} ).catch( error => {
			if ( error && error.message ) {
				addNotice( { status: 'error', message: error.message } );
			}
		} );
	}

	render() {
		const { query } = this.props;
		const step = this.getCurrentStep();

		return createElement( step.container, {
			query,
			step,
			goToNextStep: this.goToNextStep,
			updateProfile: this.updateProfile,
		} );
	}
}

export default compose(
	withDispatch( dispatch => {
		const { addNotice } = dispatch( 'wc-admin' );

		return {
			addNotice,
		};
	} )
)( ProfileWizard );
