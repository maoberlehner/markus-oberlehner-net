+++
date = "2019-05-26T07:02:02+02:00"
title = "Implementing the Builder Pattern in Vue.js Part 2: Forms"
description = "Learn how to use the Builder Pattern in Vue.js to generate highly reusable forms with form validation and submission logic already baked in."
intro = "In this article, we'll take a look at how we can use the Builder Pattern to make it very easy to create many different form components for each content type of a typical CRUD application..."
draft = false
categories = ["Development"]
tags = ["Front-End Architecture", "JavaScript", "Vue"]
images = ["https://res.cloudinary.com/maoberlehner/image/upload/c_pad,b_auto,f_auto,q_auto,w_1014,h_510/v1532158513/blog/2019-05-26/builder-director-pattern-forms-vue"]
+++

In [the last article](/blog/implementing-the-builder-pattern-in-vue-listings/) in this two-part series about implementing the Builder Pattern in Vue.js, we saw how we can use this technique to quickly create slightly different variants of the same component. **Another area in which it is very typical to have fairly similar components over and over again are forms in a CRUD application with many different content types.** In this article, we'll take a look at how we can use the Builder Pattern to make it very easy to create many different form components for each content type of a typical CRUD application.

As with the first article of this series, this article is also heavily inspired by a [talk by Jacob Schatz](https://www.youtube.com/watch?v=RF1bbhRw9sg). In his talk he also shows a possible solution for the implementation of forms with the Builder Pattern. I strongly recommend that you watch his video if you haven't done so yet.

## The FormFactory

In order to remain true to the industrial naming scheme, we start with creating a new `FormFactory` component. This component is responsible for generating a form out of an array of field definition objects.

```html
<template>
  <form
    class="form-factory"
    @submit.prevent="submit"
  >
    <div
      v-if="success"
      class="form-factory-success"
    >
      Success!
    </div>
    <template v-else>
      <FormGroup
        v-for="field in fieldsWithDefaults"
        :key="field.name"
      >
        <FormLabel :for="`${_uid}-${field.name}`">
          {{ field.label }}
          <template v-if="field.validation.required">*</template>
        </FormLabel>
        <Component
          v-model="data[field.name]"
          :is="field.component"
          v-bind="{
            ...field.options.props,
            ...field.options.attrs,
          }"
          :id="`${_uid}-${field.name}`"
          @input="$v.data[field.name].$touch()"
        />
        <FormInlineMessage
          v-if="$v.data[field.name].$error"
        >
          Please fill in this field correctly.
        </FormInlineMessage>
      </FormGroup>

      <button>Submit</button>
    </template>
  </form>
</template>

<script>
// src/components/FormFactory.vue
import { validationMixin } from 'vuelidate';

import FormGroup from './FormGroup.vue';
import FormInlineMessage from './FormInlineMessage.vue';
import FormLabel from './FormLabel.vue';

const defaultField = {
  component: null,
  label: '',
  name: '',
  options: {},
  validation: {},
};

export default {
  name: 'FormFactory',
  // We use the vuelidate validation
  // Mixin for basic form validation.
  mixins: [validationMixin],
  // Injecting dependencies makes it
  // possible or reuse this component
  // for all kinds of content types.
  inject: ['fetch', 'post'],
  components: {
    FormGroup,
    FormInlineMessage,
    FormLabel
  },
  props: {
    fields: {
      default: () => [],
      type: Array,
    },
    id: {
      default: null,
      type: [Number, String],
    },
  },
  data() {
    return {
      data: {},
      success: false,
    };
  },
  computed: {
    // Apply default field configuration
    // to make sure all properties we rely
    // on in the template do exist.
    fieldsWithDefaults() {
      return this.fields.map(x => ({ ...defaultField, ...x }));
    },
  },
  async created() {
    // If there is an ID we initially
    // load the data and switch into
    // edit mode.
    if (this.id) {
      this.data = await this.fetch(this.id);
    }
  },
  methods: {
    async submit() {
      this.$v.$touch();
      if (this.$v.$error) return;

      const { success } = await this.post(this.data);
      this.success = success;
    },
  },
  // The vuelidate validation configuration is
  // automatically generated for us.
  validations() {
    const data = this.fieldsWithDefaults
      .filter(x => x.validation)
      .reduce((prev, field) => ({
        ...prev,
        [field.name]: field.validation,
      }), {});
    return { data };
  },
};
</script>

<style>
.form-factory > :not(:first-child) {
  margin-top: 1em;
}

.form-factory-success {
  color: green;
}
</style>
```

In the code snippet above you can see that this component encapsulates quite a lot of complexity. This may not be ideal, but it will make it much easier in the future to create new form components that are fully functional right from the start without having to worry about the layout and the form validation or submission logic.

If you want to take a closer look at the code of the example you can see above, you can [see the complete demo in this CodeSandbox](https://codesandbox.io/s/implementing-the-builder-pattern-in-vuejs-forms-25vpm?fontsize=14&module=%2Fsrc%2FApp.vue).

### Using the FormFactory

In the following code snippet you can see how we can use our newly created `FormFactory` to create a new `UserForm` component which our users can use to change their settings.

```html
<template>
  <UserProvider>
    <FormFactory :fields="fields" :id="id"/>
  </UserProvider>
</template>

<script>
// src/components/UserForm.vue
import { required } from 'vuelidate/lib/validators';

import FormFactory from './FormFactory.vue';
import FormInput from './FormInput.vue';
import FormTextarea from './FormTextarea.vue';
import UserProvider from './UserProvider.vue';

export default {
  name: 'UserForm',
  components: {
    FormFactory,
    FormInput,
    FormTextarea,
    UserProvider,
  },
  props: {
    // Passing an ID as a property makes
    // the form load an existing user and
    // switches the form into editing mode.
    id: {
      default: null,
      type: [Number, String],
    },
  },
  created() {
    this.fields = [
      {
        component: FormInput,
        label: 'Name',
        name: 'name',
        options: {
          attrs: {
            placeholder: 'Your name',
          },
        },
        validation: {
          required,
        },
      },
      {
        component: FormTextarea,
        label: 'Description',
        name: 'description',
        options: {
          attrs: {
            placeholder: 'About you',
          },
        },
      },
    ];
  },
};
</script>
```

Although this already seems pretty straightforward, we can make it even simpler to initialize new forms by using the Builder Pattern.

## The FormBuilder

In addition to not having to create a new component or repeat same verbose template code for each new form, **the Builder Pattern also allows very simple dynamic creation of new components,** e.g. based on user input. Let's take a look at a possible implementation of this pattern.

```js
// src/builders/FormBuilder.js
import FormFactory from '../components/FormFactory.vue';

export default class FormBuilder {
  constructor() {
    this.props = {
      fields: []
    };
  }

  withProvider(provider) {
    this.provider = provider;
    return this;
  }

  addField(field) {
    this.props.fields.push(field);
    return this;
  }

  build() {
    const Provider = this.provider;
    const props = this.props;

    return {
      props: {
        id: {
          default: null,
          type: [Number, String],
        },
      },
      render(h) {
        return h(Provider, [
          h(FormFactory, { props: { id: this.id, ...props } }),
        ]);
      },
    };
  }
}
```

In the next code block you can see how we can use the `FormBuilder` inside of our `App.vue` root component to create a new `UserForm` on the fly.

```html
<template>
  <div id="app">
    <h2>Create User Form</h2>
    <UserForm/>

    <h2>Edit User Form</h2>
    <UserForm :id="1"/>
  </div>
</template>

<script>
// src/App.vue
import { required } from 'vuelidate/lib/validators';

import FormBuilder from './builders/FormBuilder';

import UserProvider from './components/UserProvider.vue';
import FormInput from './components/FormInput.vue';
import FormTextarea from './components/FormTextarea.vue';

export default {
  name: 'App',
  components: {
    UserForm: new FormBuilder()
      .withProvider(UserProvider)
      .addField({
        component: FormInput,
        label: 'Name',
        name: 'name',
        options: {
          attrs: {
            placeholder: 'Your name',
          },
        },
        validation: {
          required,
        },
      })
      .addField({
        component: FormTextarea,
        label: 'Description',
        name: 'description',
        options: {
          attrs: {
            placeholder: 'About you',
          },
        },
      })
      .build(),
  },
};
</script>
```

<div>
  <hr class="c-hr">
  <div class="c-service-info">
    <h2>Do you want to learn more about advanced Vue.js techniques?</h2>
    <p class="c-service-info__body">
      Register for the Newsletter of my upcoming book: <a class="c-anchor" href="https://oberlehner.us20.list-manage.com/subscribe?u=8476a98c5640f6c7b5530ea57&id=8b26bf120b" data-event-category="link" data-event-action="click: newsletter" data-event-label="Newsletter (article content)">Advanced Vue.js Application Architecture</a>.
    </p>
  </div>
  <hr class="c-hr">
</div>

## The FormDirector

Although initializing new form components is very straight forward with the `FormBuilder` class, it also can become tedious very quickly if we want to reuse a certain form component in multiple places. This is where the Director Pattern comes in handy.

```js
import { required } from 'vuelidate/lib/validators';

import UserProvider from '../components/UserProvider.vue';

import FormInput from '../components/FormInput.vue';
import FormTextarea from '../components/FormTextarea.vue';

export default class FormDirector {
  constructor(builder) {
    this.builder = builder;
  }

  makeUserForm() {
    return this.builder
      .withProvider(UserProvider)
      .addField({
        component: FormInput,
        label: 'Name',
        name: 'name',
        options: {
          attrs: {
            placeholder: 'Your name',
          },
        },
        validation: {
          required,
        },
      })
      .addField({
        component: FormTextarea,
        label: 'Description',
        name: 'description',
        options: {
          attrs: {
            placeholder: 'About you',
          },
        },
      })
      .build();
  }
}
```

In the following example you can see how we can use the `FormDirector` class from above to quickly retrieve a certain form component.

```html
<template>
  <div id="app">
    <h2>Create User Form</h2>
    <UserForm/>

    <h2>Edit User Form</h2>
    <UserForm :id="1"/>
  </div>
</template>

<script>
// src/App.vue
import FormBuilder from "./builders/FormBuilder";
import FormDirector from "./builders/FormDirector";

export default {
  name: 'App',
  components: {
    UserForm: new FormDirector(
      new FormBuilder(),
    ).makeUserForm(),
  },
};
</script>
```

Thanks to the Director Pattern, we don't have to repeat ourselves in order to create the same form component in multiple locations of our application.

<div class="c-content__broad">
  <iframe data-src="https://codesandbox.io/embed/implementing-the-builder-pattern-in-vuejs-forms-25vpm?fontsize=14&module=%2Fsrc%2FApp.vue&view=editor" title="Implementing the Builder Pattern in Vue.js: Forms" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" sandbox="allow-modals allow-forms allow-popups allow-scripts allow-same-origin"></iframe>
</div>

<div class="c-content__broad">
  <div class="c-twitter-teaser">
    <div class="c-twitter-teaser__content">
      <h2 class="c-twitter-teaser__headline">Like what you read?</h2>
      <p class="c-twitter-teaser__body">
        Follow me to get my latest Vue.js articles.
      </p>
      <a class="c-button c-button--outline c-twitter-teaser__button" rel="nofollow" href="https://twitter.com/maoberlehner" data-event-category="link" data-event-action="click: contact" data-event-label="Twitter (article content)">
        Find me on Twitter
      </a>
    </div>
  </div>
</div>

## Wrapping it up

Although the examples given in this article show the advantages very well, not everything is entirely perfect with this approach. **The Builder Pattern usually works very well if we have a lot of very similar components. Where it fails is with edge cases.** As soon as you need a form with a slightly different layout or behavior, it can quickly get nasty. But on the bright side, since we still use regular components as basic building blocks for our forms, we can decide not to use the Builder Pattern in such cases, but to build a regular component from these form components.

Overall, I can definitely see that there is a niche for this pattern. It’s definitely not a panacea for every problem, but in certain cases it can be a very elegant solution.

## References

- [Jacob Schatz, Phenomenal Design Patterns in Vue](https://www.youtube.com/watch?v=RF1bbhRw9sg)
