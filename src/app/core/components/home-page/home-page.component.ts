import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { gql } from 'apollo-angular';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { DataService } from '../../providers/data/data.service';

@Component({
    selector: 'vsf-home-page',
    templateUrl: './home-page.component.html',
    styleUrls: ['./home-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent implements OnInit {
    homePageImage : String = "source/1c/stockscreen.jpeg"
    collections$: Observable<any[]>;
    topSellers$: Observable<any[]>;
    topSellersLoaded$: Observable<boolean>;
    heroImage: SafeStyle;
    readonly placeholderProducts = Array.from({ length: 12 }).map(() => null);
    constructor(private dataService: DataService, private sanitizer: DomSanitizer) { }
    images = [
        {path: 'assets/slides/Slide1.jpg'},
        {path: 'assets/slides/Slide2.jpg'},
        {path: 'assets/slides/Slide3.jpg'},
        {path: 'assets/slides/Slide4.jpg'},
        {path: 'assets/slides/Slide5.jpg'},
        {path: 'assets/slides/Slide6.jpg'},
    ]
    ngOnInit() {
        this.collections$ = this.dataService.query(GET_COLLECTIONS, {
            options: {},
        }).pipe(
            map(data => data.collections.items
                .filter((collection: any) => collection.parent && collection.parent.name === '__root_collection__'),
            ),
        );

        this.topSellers$ = this.dataService.query(GET_TOP_SELLERS).pipe(
            map(data => data.search.items),
            shareReplay(1),
        );
        this.topSellersLoaded$ = this.topSellers$.pipe(
            map(items => 0 < items.length),
        );

        this.heroImage = this.sanitizer.bypassSecurityTrustStyle(this.getHeroImageUrl());
    }

    private getHeroImageUrl(): string {
        const { apiHost, apiPort } = environment;
        return `url('${apiHost}:${apiPort}/serverassets/${this.homePageImage}')`;
    }

}

const GET_COLLECTIONS = gql`
    query GetCollections($options: CollectionListOptions) {
        collections(options: $options) {
            items {
                id
                name
                slug
                parent {
                    id
                    slug
                    name
                }
                featuredAsset {
                    id
                    preview
                }
            }
        }
    }
`;

const GET_TOP_SELLERS = gql`
    query GetTopSellers {
        search(input: {
            take: 8,
            groupByProduct: true,
            sort: {
                price: ASC
            }
        }) {
            items {
                productId
                slug
                productAsset {
                    id
                    preview
                }
                priceWithTax {
                    ... on PriceRange {
                        min
                        max
                    }
                }
                productName
            }
        }
    }
`;
